const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AvailabilityModel = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    tradePersonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TradePeople",
    },
    date: {
      type: Date,
      default:""
    },
    timings: [
      {
        morningSlot: {
          type: Number,
          default:""
        },
        eveningSlot: {
          type: Number,
          default:""
        },
      },
    ],
  },
  {
    timestamps: true,
    strict: true,
  }
);

AvailabilityModel.set("toJSON", {
  virtuals: false,
  transform: (doc, ret, options) => {
    delete ret.__v;
  },
});

const Availability = mongoose.model("Availability", AvailabilityModel);
module.exports = Availability;
