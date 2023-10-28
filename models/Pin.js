const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PinModel = new Schema(
  {
    place: {
      type: String,
      required:true
    },
    title:{
      type: String,
    },
    zipCode: {
      type: Number,
    },
    city: {
      type: String,
    },
    state: {
      type: String
    },
    description: {
      type: String,
    },
    pinDate:{
      type:Date
    },
    pinType:{
      type:String,
      enum: ["PUBLICE", "PRIVATE"],
      default: "PRIVATE", 
    },
    images: [{type:String}],
    userId:{type: mongoose.Schema.Types.ObjectId,ref: "User",required:true},
    isDeleted: {
      type: Boolean,
      default: false,
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
