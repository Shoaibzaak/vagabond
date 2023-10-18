const mongoose = require("mongoose");
const encrypt = require("bcrypt");
const moment = require("moment");
const Schema = mongoose.Schema;
const PropertyModel = new Schema(
    {
        locationName: {
            type: String,
            enum: ["Home", "Office", "Building"],
            default: ""
        },
        postCode: {
            type: Number
        },
        town: {
            type: String
        },
        country: {
            type: String
        },
        addressLine1: {
            type: String
        },
        addressLine2: {
            type: String,
            default:""
        },

    },
    {
        timestamps: true,
        strict: true,
    }
);

PropertyModel.set("toJSON", {
    virtuals: false,
    transform: (doc, ret, options) => {
        delete ret.__v;
        delete ret.password;
    },
});

// PropertyModel.pre("save", function (next) {
//   encrypt.genSalt(10, (error, salt) => {
//     if (error) return console.log(error);
//     encrypt.hash(this.password, salt, (error, hash) => {
//       this.password = hash;
//       next();
//     });
//   });
// });
PropertyModel.methods.comparePassword = async function (password) {
    const match = await encrypt.compare(password, this.password);
    if (match) return true;
    return false;
};

const Property = mongoose.model("Properties", PropertyModel);
module.exports = Property;
