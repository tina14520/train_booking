const mongoose = require("mongoose");
const crypto = require("crypto");

const clientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    min: 6,
    max: 255,
  },
  phone: {
    type: Number,
    required: true,
    minLength: 6,
    maxLength: 255,
  },
  email: {
    type: String,
    required: false,
  },
  password: {
    type: String,
    required: true,
    min: 6,
    max: 1024,
  },
  profile_img: {
    type: String,
    required: false,
    default: 'image.png'
  },
  last_otp: {
    type: String,
  },
  previous_tickets: {
    type:[String],
    default: 'No Previous tickets Yet',

    from: {
      type: String,
    }, 
    to: {
      type: String,
    },

  },
  active:{
    type:Boolean
  }
}, {
  timestamps: true
});

clientSchema.methods.comparePassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

clientSchema.methods.generateJWT = function () {
  const today = new Date();
  const expirationDate = new Date(today);
  expirationDate.setDate(today.getDate() + 60);

  let payload = {
    id: this._id,
    email: this.email,
    name: this.name,
    phone: this.phone,
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: parseInt(expirationDate.getTime() / 1000, 10),
  });
};

clientSchema.methods.generatePasswordReset = function () {
  this.resetPasswordToken = crypto.randomBytes(20).toString("hex");
  this.resetPasswordExpires = Date.now() + 36000000; //expires in an hour
};

module.exports = mongoose.model("Client", clientSchema);
