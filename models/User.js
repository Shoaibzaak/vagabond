const mongoose = require("mongoose");
const encrypt = require("bcrypt");
const moment = require("moment");
const Schema = mongoose.Schema;
const UserModel = new Schema(
  {
    name: {
      type: String,
      default: "",
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
    phoneNumber: {
      type: Number
    },
    address: {
      type: String
    },
    is_verified: {
      type: Boolean,
      default: false,
    },
    active: {
      type: Boolean,
      default: true
    },
    stripeCustomerId: {
      type: String,
      default: "",
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
    ratingAverage: {
      type: Number,
      default: 0,
    },
    fcm_tokens: {
      token: {
        type: String
      },
      deviceType: {
        type: String,
        enum: ["android", "ios", "web"]
      }
    },
    notificationSettings: {
      messageNotify: {
        type: Boolean,
        default: true,
      },
      workerArrived: {
        type: Boolean,
        default: true,
      },
    },
    invoices: [{
      type: Schema.Types.ObjectId, ref: 'Invoice'
    }],
    deviceId: {
      type: String,
      default: "",
    },
    blocked: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isloggedIn:{
      type: Boolean,
      default: false,
    },
    isPrivacyPolicy: {
      type: Boolean,
      default: false,
    },
    isMutipleProperties: {
      type: Boolean,
      default: false,
    },

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
