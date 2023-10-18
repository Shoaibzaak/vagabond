const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const JobTemplateModel = new Schema(
  {
    subject: {
      type: String,
      default: "",
    },
    message: {
      type: String,
      default: "",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    strict: true,
  }
);

JobTemplateModel.set("toJSON", {
  virtuals: false,
  transform: (doc, ret, options) => {
    delete ret.__v;
  },
});

const JobTemplate = mongoose.model("JobTemplate", JobTemplateModel);
module.exports = JobTemplate;
