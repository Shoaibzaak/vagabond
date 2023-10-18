const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const moment = require("moment");

const InvoiceModel = new Schema(
    {
        senderId: {
            type: Schema.Types.ObjectId,
            refPath: "senderModelType", //Dynamic referencing
        },
        recipientId: {
            type: Schema.Types.ObjectId,
            refPath: "recipientModelType", //Dynamic referencing
        },
        senderModelType: {
            type: String,
            enum: ["CompanyUser", "TradePeople"],
            required: true,
        },
        recipientModelType: {
            type: String,
            enum: ["CompanyUser", "TradePeople"],
            required: true,
        },
        payments: [{
            type: Schema.Types.ObjectId, ref: 'PaymentDetail'
        }],
        credit:{
          type:Number,
          // max is used there to put limit on credit amount
          max: 10000
        },
        jobId:{
            type: Schema.Types.ObjectId, ref: 'Job'
        },
        invoiceNumber: {
            type: Number
        },
        date: {
            type: Number,
            default: () => Date.now() + 7*24*60*60*1000
            // default: moment().valueOf(),
        },
        isSeen: {
            type: Boolean,
            default: false,
        },
        description: {
            type: String,
        },
        status: {
            type: String,
            enum: [
                "Requested",
                "Pending,",
                "Paid"
                ,
            ],
            default: "Pending",
        },
    },
    {
        timestamps: true,
        strict: true,
    }
);

InvoiceModel.set("toJSON", {
    virtuals: false,
    transform: (doc, ret, options) => {
        delete ret.__v;
    },
});

const Invoice = mongoose.model("Invoice", InvoiceModel);
module.exports = Invoice;
