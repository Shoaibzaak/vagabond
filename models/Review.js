const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const TradePeople = require("./TradePeople");
const User = require("./User");
const moment = require("moment");

const ReviewModel = new Schema(
  // who is given the review
  {
    revieweGiverId: {
      type: Schema.Types.ObjectId,
      refPath: "revieweGiverModelType", //Dynamic referencing
    },
    //whom to review is given
    revieweTakerId: {
      type: Schema.Types.ObjectId,
      refPath: "revieweTakerModelType", //Dynamic referencing
    },
    revieweGiverModelType: {
      type: String,
      enum: ["User", "TradePeople"],
      required: true,
    },
    revieweTakerModelType: {
      type: String,
      enum: ["User", "TradePeople"],
      required: true,
    },
    comment: {
      type: String,
      default: "",
    },
    rating: {
      type: Number,
      enum: [1, 2, 3, 4, 5],
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

ReviewModel.set("toJSON", {
  virtuals: false,
  transform: (doc, ret, options) => {
    delete ret.__v;
  },
});

// ReviewModel.post("save", async function (doc, next) {
//   if (doc.reviewerModelType === "User") {
//     const business = await Business.findOne({ _id: doc.revieweeId });
//     business.ratingCount = business.ratingCount + 1;
//     business.ratingAverage =
//       (business.ratingAverage * (business.ratingCount - 1) + doc.rating) /
//       business.ratingCount;
//     await Business.findOneAndUpdate({ _id: doc.revieweeId }, business);
//   } else {
//     const user = await User.findOne({ _id: doc.revieweeId });
//     user.ratingCount = user.ratingCount + 1;
//     user.ratingAverage =
//       (user.ratingAverage * (user.ratingCount - 1) + doc.rating) /
//       user.ratingCount;
//     await User.findOneAndUpdate({ _id: doc.revieweeId }, user);
//   }

//   next();
// });

const Review = mongoose.model("Review", ReviewModel);
module.exports = Review;
