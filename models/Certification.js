const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CertificationModel = new Schema(
  {

    userId: {
      type: Schema.Types.ObjectId,
      ref: "CompanyUser", //Dynamic referencing
    },
    tradePerson: {
      type: Schema.Types.ObjectId,
      ref: "TradePeople"

    },
    certificateName: {
      type: String
    },
    Type: {
      type: String,
      enum: ["Certification_Gas", "Certification_EPC", "Certification_Electric", "select_all"],
      default: ""
    },
    gasCertificationNumber: {
      type: Number
    },
    certificates: [{
      type: String
    }],
    dates: [{
      type: Date,
      default: ""
    }],
    timings: [
      {
        morningSlot: {
          type: Number,
          default: ""
        },
        eveningSlot: {
          type: Number,
          default: ""
        },
      },
    ],

  },
  {
    timestamps: true,
    strict: true,
  }
);

CertificationModel.set("toJSON", {
  virtuals: false,
  transform: (doc, ret, options) => {
    delete ret.__v;
  },
});

const Certification = mongoose.model("Certification", CertificationModel);
module.exports = Certification;
