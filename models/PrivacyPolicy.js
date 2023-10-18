const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const privacyPolicySchema = new Schema(
  {
    content: {
      type: String,
      required: true,
    },
    version: {
      type: String,
      required: true,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  }
);

const PrivacyPolicy = mongoose.model("PrivacyPolicy", privacyPolicySchema);

module.exports = PrivacyPolicy;
