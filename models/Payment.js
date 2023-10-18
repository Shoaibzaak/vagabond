const mongoose = require("mongoose");
const moment = require("moment");
const Schema = mongoose.Schema;

const PaymentDetails = new Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        accountNumber: {
            type: String,
            required: true,
        },
        bankName: {
            type: String,
            required: true,
        },
        accountHolderName: {
            type: String,
            required: true,
        },
        sortCode: {
            type: String,
            required: true,
        },

    },
    {
        timestamps: true,
        strict: true,
    }
);

PaymentDetails.set("toJSON", {
    virtuals: false,
    transform: (doc, ret, options) => {
        delete ret.__v;
    },
});

const PaymentDetail = mongoose.model("PaymentDetail", PaymentDetails);
module.exports = PaymentDetail;
