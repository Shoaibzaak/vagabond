const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const moment = require("moment");

const ReportReviewModel = new Schema(
  {
    ReportSenderId: {
      type: Schema.Types.ObjectId,
      refPath: "ReportSenderModelType", //Dynamic referencing
    },
    ReportReceiverId: {
      type: Schema.Types.ObjectId,
      refPath: "ReportReceiverModelType", //Dynamic referencing
    },

    ReportSenderModelType: {
      type: String,
      enum: ["User", "TradePeople"],
      required: true,
    },
    ReportReceiverModelType: {
      type: String,
      enum: ["User", "TradePeople"],
      required: true,
    },
    comment: {
      type: String,
    },
    date: {
      type: Number,
      default: moment().valueOf(),
    },

  },
  {
    timestamps: true,
    strict: true,
  }
);

ReportReviewModel.set("toJSON", {
  virtuals: false,
  transform: (doc, ret, options) => {
    delete ret.__v;
  },
});

const ReportReview = mongoose.model("ReportReview", ReportReviewModel);
module.exports = ReportReview;
