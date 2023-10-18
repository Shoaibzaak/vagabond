const mongoose = require("mongoose");
const encrypt = require("bcrypt");
const Schema = mongoose.Schema;
const TradePeopleModel = new Schema(
  {
    name: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      lowercase: true,
      required: true,
      unique: true,
    },
    phoneNumber: {
      type: String
    },
    password: {
      type: String,
    },
    address: {
      type: String
    },
    vatNumber: {
      type: String,
    },
    registrationNumber: {
      type: String,
    },
    location: {
      type: {
        type: String, // Don't do `{ location: { type: String } }`
        enum: ['Point'], // 'location.type' must be 'Point'

      },
      coordinates: {
        type: [Number],
      }
    },
    radius: {
      type: Number,
      default: 0,
    },
    is_verified: {
      type: Boolean,
      default: false,
    },
    insuranceDocument: {
      type: String,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
    ratingAverage: {
      type: Number,
      default: 0,
    },
    calenders:
      { type: Schema.Types.ObjectId, ref: 'Calender' },
    certification: [
      { type: Schema.Types.ObjectId, ref: 'Certification' }],
    jobs: [
      { type: Schema.Types.ObjectId, ref: 'Job' }

    ],
    notificationSettings: {
      openToWork: {
        type: Boolean,
        default: false,
      },
      messageNotify: {
        type: Boolean,
        default: true,
      },
      relevantJobs: {
        type: Boolean,
        default: true,
      },
      paymentReceived: {
        type: Boolean,
        default: true,
      },
    },
    certified: {
      type: Boolean,
      default: true,
    },
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
    profileSetup: {
      type: Boolean,
      default: false
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
    stripeCustomerId: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    strict: true,
  }
);

TradePeopleModel.set("toJSON", {
  virtuals: false,
  transform: (doc, ret, options) => {
    delete ret.__v;
    delete ret.password;
  },
});

TradePeopleModel.methods.comparePassword = async function (password) {
  const match = await encrypt.compare(password, this.password);
  if (match) return true;
  return false;
};
const BusinessUser = mongoose.model("TradePeople", TradePeopleModel);
module.exports = BusinessUser;
