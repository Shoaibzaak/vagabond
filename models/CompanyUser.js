const mongoose = require("mongoose");
const encrypt = require("bcrypt");
const moment = require("moment");
const Schema = mongoose.Schema;
const CompanyUserModel = new Schema(
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
    profilePicture:{
     type:String
    },
    companyCode: {
      type: Number
    },
    addresses: [{
      type: Schema.Types.ObjectId, ref: 'Properties'
    }],
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
    is_verified: {
      type: Boolean,
      default: false,
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
    certificates: [
      { type: Schema.Types.ObjectId, ref: "Certification" }
    ],
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
    isMutipleProperties:{
      type: Boolean,
      default: true,
    }

  },
  {
    timestamps: true,
    strict: true,
  }
);

CompanyUserModel.set("toJSON", {
  virtuals: false,
  transform: (doc, ret, options) => {
    delete ret.__v;
    delete ret.password;
  },
});

// CompanyUserModel.pre("save", function (next) {
//   encrypt.genSalt(10, (error, salt) => {
//     if (error) return console.log(error);
//     encrypt.hash(this.password, salt, (error, hash) => {
//       this.password = hash;
//       next();
//     });
//   });
// });
CompanyUserModel.methods.comparePassword = async function (password) {
  const match = await encrypt.compare(password, this.password);
  if (match) return true;
  return false;
};

const CompanyUser = mongoose.model("CompanyUser", CompanyUserModel);
module.exports = CompanyUser;
