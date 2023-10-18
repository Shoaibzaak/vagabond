const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ContactUs = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    tradePeopleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TradePeople",
    },
    name: {
      type: String,
    },
    email: {
      type: String,
    },
    message: {
      type: String,
    },
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);
ContactUs.set("toJSON", {
  virtuals: false,
  transform: (doc, ret, options) => {
    delete ret.password;
    delete ret.__v;
  },
});

const Contact = mongoose.model("contact", ContactUs);
module.exports = Contact;
