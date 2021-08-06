const { validationResult } = require("express-validator");
const Driver = require("../../models/Driver");
const Admin = require("../../models/Admin");
const Trip = require("../../models/Trip");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const base64Img = require("base64-img");
const axios = require("axios");
const mongoose = require("mongoose");
require('dotenv');



const runloop = async (imagesArray) => {
  for (let i = 0; i < imagesArray.length; i++) {
    const img = imagesArray[i].value;
    const fileParam = imagesArray[i].name;
    await new Promise((resolve) => {
      setTimeout(resolve, 100);
      try {
        convertImg(img, fileParam);
      } catch (error) {
        throw new Error("Error converting the image: " + error);
      }
    });
  }
};

var imagesIncoded = [];
const convertImg = async (img, fileParam) => {
  var imgObj = {};
  await base64Img.img(img, "public/uploads", Date.now(), (err, filePath) => {
    const pathArr = filePath.split("/");
    const fileName = pathArr[pathArr.length - 1];
    const as = pathArr.splice(1);
    const path = as.join("/");

    imgObj["fileName"] = fileName;
    imgObj["path"] = path;
    imgObj["fileParam"] = fileParam;

    imagesIncoded.push(imgObj);
  });
};

exports.login = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      errors: errors.array(),
    });
  }
  const { email, password } = req.body;
  const admin = await Admin.findOne({
    email,
  });
  if (!admin)
    return res.status(404).json({
      message: "Not Found: User does not exist",
    });

  const validPass = await bcrypt.compare(password, admin.password);

  if (!validPass)
    return res.status(401.1).json({
      message: "Unauthorized: Access is denied due to invalid credentials..",
    });

  // Create token
  const token = jwt.sign(
    { 
      _id: admin._id,
    },
    process.env.ADMIN_TOKEN_SECERT
  );
  res.status(200).json({
    admin: admin,
    token: token
  });
  next();
};

//  ADMIN ACCOUNT REGISTER
exports.register = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      errors: errors.array(),
    });
  }

  var { name, email, phone, password, profile_img } = req.body;
  // var imgsArray = [
  //   {
  //     name: "profile_img",
  //     value: profile_img,
  //   },
  // ];

  // CHECK IF EMAIL OR PHONE ALREADY EXISTS
  const emailExists = await Admin.findOne({
    email,
  });
  const phoneExists = await Admin.findOne({
    phone,
  });
  if (emailExists)
    return res.status(400).json({
      message: "Email Already Exists",
    });
  else if (phoneExists)
    return res.status(400).json({
      message: "Phone Already Exists",
    });

  // HASH PASSWORD
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // UPLOAD IMAGES TO SERVER
  // await runloop(imgsArray);

  // profile_img = imagesIncoded.find(
  //   (x) => x.fileParam === "profile_img"
  // ).fileName;

  const admin = new Admin({
    name,
    email,
    phone,
    password: hashedPassword,
    // profile_img,
  });
  try {
    const savedAdmin = await admin.save();
    res.status(201).json({
      message: "Success: Account Created Successfully",
      admin: savedAdmin,
    });
  } catch (err) {
    res.status(500).send(err);
  }
  next();
};

exports.forget_admin_password = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      errors: errors.array(),
    });
  }
  try {
    const { email, new_password } = req.body;
    const admin = await Admin.findOne({
      email,
    });
    if (!admin)
      return res.status(404).json({
        message: "Not Found: User does not exist",
      });
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(new_password, salt);
    const updatedAdmin = await Admin.updateOne(
      {
        email,
      },
      {
        $set: {
          password: hashedPassword,
        },
      }
    );
    return res.status(200).json({
      msg: "Password changed succesfully",
    });
  } catch (error) {
    // return next(new Error(error))
    res.status(500).send(error);
  }
  next();
};

exports.reset_password = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      errors: errors.array(),
    });
  }
  const { user_id, new_password } = req.body;

  if (mongoose.Types.ObjectId.isValid(user_id)) {
    const admin = await Admin.findOne({
      _id: user_id,
    });
    if (!admin)
      return res.status(404).json({
        message: "Not Found: User does not exist",
      });
    try {
      // HASH PASSWORD
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(new_password, salt);
      const updatedAdmin = await Admin.updateOne(
        {
          _id: user_id,
        },
        {
          $set: {
            password: hashedPassword,
          },
        }
      );
      return res.status(200).json({
        msg: "Password changed succesfully",
      });
    } catch (error) {
      res.status(500).send(error);
    }
  } else {
    return res.status(400).json({
      message: "Invalid User ID",
    });
  }
  next();
};

exports.getAllTrips = async (req, res, next) => {
  var allTrips;
  await Trip.find({})
    .populate("client")
    .populate("driver")
    .exec((err, doc) => {
      allTrips = doc;
      res.status(200).json({ allTrips });
    });
  next();
};

exports.getAllDrivers = async (req, res, next) => {
  var allDrivers;
  await Driver.find({}, (err, doc) => {
    if (err) res.status(500).json({ err });

    res.status(200).json(doc);
  });
  next();
};
