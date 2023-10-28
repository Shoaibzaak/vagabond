const mongoose = require("mongoose");
const encrypt = require("bcrypt");
const moment = require("moment");
const Schema = mongoose.Schema;
const UserModel = new Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      required: true
    },
    password: {
      type: String
    },
    otp: {
      type: Number
    },
    otpExpiry: {
      type: Number
    },
    isEmailConfirmed: {
      type: Boolean,
      default: false,
    },
    device_id: {
      type: String
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    facebookId: {
      type: String
    },
    googleId: {
      type: String
    },
    accessToken: {
      type: String
    }
  },
  {
    timestamps: true,
    strict: true,
  }
);

UserModel.set("toJSON", {
  virtuals: false,
  transform: (doc, ret, options) => {
    delete ret.__v;
    delete ret.password;
  },
});

// UserModel.pre("save", function (next) {
//   encrypt.genSalt(10, (error, salt) => {
//     if (error) return console.log(error);
//     encrypt.hash(this.password, salt, (error, hash) => {
//       this.password = hash;
//       next();
//     });
//   });
// });
UserModel.methods.comparePassword = async function (password) {
  const match = await encrypt.compare(password, this.password);
  if (match) return true;
  return false;
};

const User = mongoose.model("User", UserModel);
module.exports = User;
