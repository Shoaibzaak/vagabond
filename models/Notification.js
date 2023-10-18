const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const moment = require("moment");

const NotificationModel = new Schema(
  {
    senderId: {
      type: Schema.Types.ObjectId,
      refPath: "senderModelType", //Dynamic referencing
    },
    recipientId: {
      type: Schema.Types.ObjectId,
      refPath: "recipientModelType", //Dynamic referencing
    },
    senderModelType: {
      type: String,
      enum: ["User", "BusinessUser"],
      required: true,
    },
    recipientModelType: {
      type: String,
      enum: ["User", "BusinessUser"],
      required: true,
    },
    message: {
      type: String,
      default: "",
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
    },
    shiftId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shift",
    },
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
    },
    notificationType: {
      type: String,
      enum: ["JOB", "SHIFT", "INVITE", "SELECT"],
      default: "JOB",
    },
    date: {
      type: Number,
      default: moment().valueOf(),
    },
    isSeen: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  {
    timestamps: true,
    strict: true,
  }
);

NotificationModel.set("toJSON", {
  virtuals: false,
  transform: (doc, ret, options) => {
    delete ret.__v;
  },
});

const Notification = mongoose.model("Notification", NotificationModel);
module.exports = Notification;
