const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PinModel = new Schema(
  {
    place: {
      type: String,
    },
    zipCode: {
      type: Number,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    description: {
      type: String,
    },
    
  },

  {
    timestamps: true,
    strict: true,
  }
);

PinModel.set("toJSON", {
  virtuals: false,
  transform: (doc, ret, options) => {
    delete ret.__v;
  },
});

const Pin = mongoose.model("Pin", PinModel);
module.exports = Pin;
