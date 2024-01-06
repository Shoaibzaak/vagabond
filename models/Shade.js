const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const shadeModel = new Schema(
  {
    countrName: {
      type: String,
    },
    state: {
      type: String,
    },
    color: {
      type: String,
    },
    location: {
        type: {
          type: String, // Don't do `{ location: { type: String } }`
          enum: ['Point'], // 'location.type' must be 'Point'
        },
        coordinates: {
          type: [Number],
        }
      },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
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

shadeModel.set("toJSON", {
  virtuals: false,
  transform: (doc, ret, options) => {
    delete ret.__v;
  },
});

const shade = mongoose.model("shade", shadeModel);
module.exports = shade;
