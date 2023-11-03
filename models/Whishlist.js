const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const WhishlistModel = new Schema(
  {
    place: {
      type: String,
      required:true
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
    userId:{type: mongoose.Schema.Types.ObjectId,ref: "User",required:true},
    
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
