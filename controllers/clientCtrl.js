const Client = require("../models/client");
const Ticket = require("../models/ticket");
const {
  validationResult
} = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const base64Img = require("base64-img");
const mongoose = require("mongoose");
const decode = require('../config/jwtDecode');
const  axios = require('axios')

var sendOtpCode = (req, res) => {
    var {
      phone
    } = req.query;
    var otp = 1234;
    var checkedClient = Client.findOneAndUpdate({
      phone
    }, {
      $set: {
        "last_otp": otp
      }
    }, {
      new: true
    }, (err, doc) => {
      if (err) return res.status(500).json({
        err
      });
      res.status(200).json({
        message: "Verification Code Sent",
      })

    })

    if(!checkedClient){ return res.status(404).json({msg: "User not found"})}

   else {
    res.status(503).json({
      message: "Error Occured",
    })
  }

    // console.log(otp)
};

const convertLoop = async (imagesArray) => {
  for (let i = 0; i < imagesArray.length; i++) {
    const img = imagesArray[i].value;
    const fileParam = imagesArray[i].name;
    try {
      await convertImg(img, fileParam);
    } catch (error) {
      throw new Error("Error converting the image: " + error);
    }
  }
};
var imagesIncoded = [];
const convertImg = async (img, fileParam) => {
  var imgObj = {};
  await base64Img.img(img, "public/uploads", Date.now(), (err, filePath) => {
    if (err) console.log("err :", err);
    const pathArr = filePath.split("/");
    const fileName = pathArr[pathArr.length - 1];
    const as = pathArr.splice(1);
    const path = as.join("/");
    imgObj["fileName"] = fileName;
    imgObj["path"] = path;
    imgObj["fileParam"] = fileParam;
    imagesIncoded.push(imgObj);
    console.log("from convert");
    console.log(imagesIncoded);
  });
};
// GET 4-DIGITS OTP CODE
exports.getOtp = async (req, res, next) => {
  sendOtpCode(req, res);
};

exports.dashRegister = async (req, res, next) => {
  var {
    name,
    phone
  } = req.body

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      errors: errors.array(),
    });
  }

  const checkClient = await Client.findOne({
    phone,
  }, (err, doc) => {
    if (err) return res.status(500).json({
      err
    })
  });

  if (checkClient) return res.status(409).json({
    message: "Account already exist",
  });
  var randomPassword = await Math.floor(1000 + Math.random() * 9000).toString();

  // HASH PASSWORD
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(randomPassword, salt);


  const client = await new Client({
    name,
    phone,
    password: hashedPassword,
  });

  const savedClient = await client.save();

  res.status(201).json({
    msg: "Account created",
    client: savedClient
  })


}

//  CLIENT ACCOUNT REGISTER
exports.register = async (req, res, next) => {
  var {
    name,
    email,
    phone,
    password,
    profile_img
  } = req.body;
 
  const checkPhone = await Client.findOne({
      phone,
    }, (err, doc) => {
      if (err) return res.status(500).json({
        err
      })
    });
  
    if (checkPhone) return res.status(409).json({
      message: "Phone already exist",
    });

    const checkEmail = await Client.findOne({
      email,
    }, (err, result) => {
      if (err) return res.status(500).json({
        err
      })
    });
  
    if (checkEmail) return res.status(409).json({
      message: "Email already exist",
    });
  
  var imgsArray = [{
    name: "profile_img",
    value: profile_img,
  }, ];


  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      errors: errors.array(),
    });
  }

  // HASH PASSWORD
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  console.log("From register");
  console.log("this is another log");
  const client = await new Client({
    name,
    email,
    phone,
    password: hashedPassword,
    // profile_img,
  });
  try {
    const savedClient = await client.save();
    console.log("saved");
    res.status(201).json({
      message: "Success: Account Created Successfully",
      client: savedClient,
    });
  } catch (err) {
    console.log("err", err);
    res.status(500).send(err);
  }
};

exports.forgot_password = async (req, res, next) => {
  try {
    const {
      phone,
      password
    } = req.body;
    const client = await Client.findOne({
      phone,
    });
    if (!client)
      return res.status(404).json({
        message: "Not Found: User does not exist",
      });
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const updatedClient = await Client.updateOne({
      phone,
    }, {
      $set: {
        password: hashedPassword,
      },
    });
    return res.status(200).json({
      message: "Password changed succesfully",
      updatedClient,
    });
  } catch (error) {
    return next(new Error(error));
  }
};

exports.reset_password = async (req, res, next) => {
  const {
    new_password,
    phone,
    otp
  } = req.body
  try {

    const resetClient = await Client.findOne({
      phone
    })
    if (!resetClient) return res.status(404).json({
      msg: "No user found"
    })

    console.log(resetClient);

    if (otp !== resetClient.last_otp) return res.status(403).json({
      msg: "Wrong code"
    })

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(new_password, salt);

    await Client.findOneAndUpdate({
      phone
    }, {
      $set: {
        password: hashedPassword
      }
    }, {
      new: true
    }, (err, doc) => {
      if (err) return res.status(500).json({
        msg: "Unexpected error"
      })
      res.status(200).json({
        msg: "Password updated successfully"
      })
    })
  } catch (error) {
    return res.status(500).json({
      error
    })
  }
};

exports.login = async (req, res, next) => {
  const {
    phone,
    email,
    password
  } = req.body;
  const client = await Client.findOne({
    email,
  });
  if (!client)
    return res.status(404).json({
      message: "Not Found: User does not exist",
    });

  const validPass = await bcrypt.compare(password, client.password);

  if (!validPass)
    return res.status(401.1).json({
      message: "Unauthorized: Access is denied due to invalid credentials..",
    });

  let token = jwt.sign({
    _id: client._id
  }, 'CLIENT_TOKEN_SECRET');

  res.status(200).json({
    client: client,
    token: token
  });
};

exports.checkUserOtp = async (req, res, next) => {
  const {
    phone
  } = req.query;
  const client = await Client.findOne({
    phone,
  });
  if (!client)
    return res.status(404).json({
      message: "Not Found: User does not exist",
    });
  await sendOtpCode(req, res);

};

exports.validateOtp = async (req, res, next) => {
  const {
    phone, otp
  } = req.body;
  const client = await Client.findOne({
    phone,
    last_otp: otp
  });
  if (!client)
    return res.status(403).json({
      message: "Not valid OTP",
    });

    const updatedClient = await Client.findOneAndUpdate({
      phone,
    }, {
      $set: {
        active: true
      }
    });

    res.status(200).json({msg: "Success"})

};

exports.get_balance = async (req, res, next) => {
  const clientId = req.query.client_id
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      errors: errors.array(),
    });
  }

  const token = req.headers["authorization"];

  const playLoad = decode(token);

  const client_id = playLoad.token;

  const client = await Client.findOne({
    _id: clientId,
  });
  if (!client)
    return res.status(404).json({
      message: "Not Found: User does not exist",
    });
  const {
    balance
  } = client;
  res.status(200).json({
    balance
  });
  next();
};

exports.get_tickets = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      errors: errors.array(),
    });
  }

  const token = req.headers["authorization"];

  const playLoad = decode(token);

  const client_id = playLoad.token;


  const tickets = await Ticket.find({
    client_id,
  });

  res.status(200).json({
    tickets,
  });
  next();

};

exports.getClient = async (req, res, next) => {

  const token = req.headers["authorization"];

  const playLoad = decode(token);

  const client_id = playLoad.token;

  if (!mongoose.Types.ObjectId.isValid(client_id))
    return res.status(422).json({
      msg: "invalid id",
    });

  const client = await Client.findOne({
    client_id,
  });
  if (!client)
    return res.status(404).json({
      msg: "Client not found",
    });
  res.status(200).json({
    client,
  });

  next();
};

exports.getAllTickets = async (req, res, next) => {
  const token = req.headers["authorization"];

  const playLoad = decode(token);

  const client_id = playLoad.token;

  Ticket.find({
      client_id,
    })
    .populate("client")
    .populate("driver")
    .exec((err, doc) => {
      if (err)
        return res.status(500).json({
          err,
        });
      res.status(200).json({
        tickets: doc,
      });
    });
  next();
};

exports.searchClients = async (req, res, next) => {
  var {
    searchQuery
  } = req.query;
  var regex = new RegExp(`${searchQuery}`, "i"); // 'i' makes it case insensitive
  Client.find({
      name: regex,
    },
    (err, doc) => {
      return res.status(200).json(doc);
    }
  );
};

exports.checkVersion = async (req, res, next) => {
  const {
    app_version
  } = req.query
  var min_version;
  await Settings.findOne({
      name: 'MINIMUM_CLIENT_APP_VERSION'
    })
    .exec((err, doc) => {
      if (err) return res.status(500).json({
        err
      })
      min_version = doc.value
      const is_valid = semver.gte(`${app_version}`, `${min_version}`)
      res.status(200).json({
        is_valid,
        min_version
      })
    })
}
exports.addSavedPlaces = async (req, res, next) => {
  const token = req.headers["authorization"];

  const playLoad = decode(token);

  const client_id = playLoad._id;

  const {
    lat,
    lng,
    place_name
  } = req.body;
  const client = await Client.findOne({
    _id: client_id,
  });
  if (!client)
    return res.status(404).json({
      msg: "Dose Not Exist",
    });
  await Client.findOneAndUpdate({
      _id: client_id,
    }, {
      $set: {
            previous_tickets: {
          from: from,
          to: to
        }
      },
    }, {
      new: true,
    },
    (err, result) => {
      if (err) {
        res.status(500).json({
          err,
        });
      }
      res.status(200).json({
        result,
      });
    }
  ).populate('previous_tickets');
  next();
};

exports.get_previous_tickets= async (req, res, next) => {

  const token = req.headers["authorization"];

  const playLoad = decode(token);

  const client_id = playLoad._id;

  const client = await Client.findOne({
    _id: client_id
  }).select('-__v -_id -password -name -email -phone -profile_img -balance -createdAt -updatedAt');
  if (!client)
    return res.status(404).json({
      msg: "Client not found",
    });
  res.status(200).json({
    client,
  });

};
exports.add_passenger = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      errors: errors.array(),
    });
  }

  const { name, email, password, phone } = req.body;

  const passEmail = await Client.findOne({
    email,
  });

  if (passEmail) {
    return res.send("this email is already used");
  }
  const passPhone = await Client.findOne({
    phone,
  });

  if (passPhone) {
    return res.send("This Phone Number is Already Used");
  }

  const passenger = await new Client({
    name,
    email,
    password,
    phone,
  });
  await Client.save((err) => {
    if (err)
      return res.status(500).json({
        err,
      });
    res.status(201).json({
      msg: "Success",
      passenger,
    });
  });
};

//update passenger
exports.update_passenger = async (req, res, next) => {
  const entries = Object.keys(req.body);
  const updates = {};

  // constructing dynamic query

  for (let i = 0; i < entries.length; i++) {
    updates[entries[i]] = Object.values(req.body)[i];
  }
  await Client.findOneAndUpdate(
    {
      _id: req.params.id,
    },
    {
      $set: updates,
    },
    {
      new: true,
    },
    (err, success) => {
      if (err) throw err;
      else {
        res.send({
          msg: "update success",
          updates,
        });
      }
    }
  );
};
//DELETE PASSENGER
exports.delete_passenger = async (req, res, next) => {
  // const { id } = req.body;
  await Client.findOneAndRemove(
    {
      _id: req.params.id,
    },
    (err, result) => {
      if (err) {
        res.status(500).json({
          err,
        });
      }
      res.status(200).json({
        result,
      });
    }
  );
};
//ADD PASSENGER
exports.add_passenger = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      errors: errors.array(),
    });
  }
  const { name, email, password, phone, balance, profile_img } = req.body;

  const passphone = await Client.findOne({
    phone,
  });

  const capphone = await Client.findOne({
    phone,
  });

  const passenger = await Client.findOne({
    email,
  });

  const captain = await Client.findOne({
    email,
  });

  if (passphone || capphone)
    return res.status(404).json({
      msg: "this phone number is already used",
    });
  if (passenger || captain)
    return res.status(404).json({
      msg: "this Email is already used",
    });

  const newPassenger = await new Client({
    name,
    password,
    email,
    phone,
    balance,
    profile_img,
  });

  await newPassenger.save((err) => {
    if (err)
      return res.status(500).json({
        err,
      });
    res.status(200).json({
      msg: "Success",
      newPassenger,
    });
  });
};
//get all passengers
exports.getAll = async (req, res, next) => {
  await Client.find((error, passengers) => {
    if (error) {
      return res.status(500).json({
        message: "couldn't find any passengers",
        error,
      });
    }
    res.status(200).json({
      passengers,
    });
  }).select("-__v ");
};
