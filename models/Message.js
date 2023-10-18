const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// mongoose.set("useCreateIndex", true);

const MessageModel = new Schema(
  {
    sentBy: {
      type: Schema.Types.ObjectId, // user who sent the message
      refPath: "sentByModelType",
    },
    sentTo: { // user who received the message
      type: Schema.Types.ObjectId,
      refPath: "sentToModelType",
    },
    sentToModelType: {
      type: String,
      enum: ["User","Business","Admin"],
      required: true,
    },
    sentByModelType: {
      type: String,
      enum: ["User","Business","Admin"],
      required: true,
    },
    message: {
      type: String,
    },
    date: {
      type: Number,
    },
    files: {
      type: [String],
    },
    fileType: {
      type: String,
    },
    archived: {
      type: Boolean,
      default: false,
    },
  },

  {
    timestamps: true,
    strict: true,
  }
);

const Message = mongoose.model("Message", MessageModel);

module.exports = Message;
