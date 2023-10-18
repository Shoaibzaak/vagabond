const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const JobModel = new Schema(
  {
    title: {
      type: String,
    },
    description: {
      type: String,
      required: true,
    },
    jobType: {
      type: String,
      enum: [
        "Plumbing",
        "Multitrade",
        "Roofing",
        "Electrical",
        "General_building",
        "Drainage",
        "Locksmiths",
      ],
      default: "i'm unsure of what i need",
    },
    images: [{
      type: String,
      required: true,
    }],
    tradePerson: {
      type: Schema.Types.ObjectId, ref: 'TradePeople'
    },
    availability:
      { type: Schema.Types.ObjectId, ref: 'Availability' }
    ,
    certification:
      { type: Schema.Types.ObjectId, ref: 'Certification' }
    ,
    status: {
      type: String,
      enum: [
        "Requested",
        "Pending,",
        "Completed"
        ,
      ],
      default: "Requested",
    },
  },

  {
    timestamps: true,
    strict: true,
  }
);

JobModel.set("toJSON", {
  virtuals: false,
  transform: (doc, ret, options) => {
    delete ret.__v;
  },
});

const Job = mongoose.model("Job", JobModel);
module.exports = Job;
