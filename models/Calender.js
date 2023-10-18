const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CalenderModel = new Schema(
    {

        tradePeopleId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "TradePeople",
        },
        calenders: [{
            type: String,
        }],

    },
    {
        timestamps: true,
        strict: true,
    }
);

CalenderModel.set("toJSON", {
    virtuals: false,
    transform: (doc, ret, options) => {
        delete ret.__v;
    },
});

const Calender = mongoose.model("Calender", CalenderModel);
module.exports = Calender;
