const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ContactListModel = new Schema(
    {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            unique: true,
            lowercase: true,
            trim: true,
            required: true
        },
        phoneNo: {
            type: Number,
        },
        subject: {
            type: String
        },
        description: {
            type: String
        },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User"},

    },

    {
        timestamps: true,
        strict: true,
    }
);

ContactListModel.set("toJSON", {
    virtuals: false,
    transform: (doc, ret, options) => {
        delete ret.__v;
    },
});

const ContactList = mongoose.model("ContactList", ContactListModel);
module.exports = ContactList;
