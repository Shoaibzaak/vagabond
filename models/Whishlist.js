const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const WhishlistModel = new Schema(
  {
    countryName: {
      type: String,
    },
    state: {
      type: String,
    },
    place: {
      type: String,
      required: true,
    },
    location: {
      type: {
        type: String, // Don't do `{ location: { type: String } }`
        enum: ["Point"], // 'location.type' must be 'Point'
      },
      coordinates: {
        type: [Number],
      },
    },
    isVisited:{
      type: Boolean,
      default: false,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
  },

  {
    timestamps: true,
    strict: true,
  }
);

WhishlistModel.set("toJSON", {
  virtuals: false,
  transform: (doc, ret, options) => {
    delete ret.__v;
  },
});

const Whishlist = mongoose.model("Whishlist", WhishlistModel);
module.exports = Whishlist;
