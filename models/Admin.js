const mongoose = require("mongoose");
const encrypt = require("bcrypt");
const Schema = mongoose.Schema;
const AdminSchema = new Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    profilePic: {
      type: String,
      default: "",
    },
    mobileNumber: {
      type: String,
    },
    password: {
      type: String,
    },
    role:{
      type: String,
      default: "superadmin"
    },
    isloggedIn:{
      type: Boolean,
      default:false

    }
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);
AdminSchema.set("toJSON", {
  virtuals: false,
  transform: (doc, ret, options) => {
    delete ret.password;
    delete ret.__v;
  },
});
AdminSchema.pre("save", function (next) {
  encrypt.genSalt(10, (error, salt) => {
    if (error) return console.log(error);
    encrypt.hash(this.password, salt, (error, hash) => {
      this.password = hash;
      next();
    });
  });
});
AdminSchema.methods.comparePassword = function (password, cb) {
  encrypt.compare(password, this.password, function (error, match) {
    if (error) return cb(false);
    if (match) return cb(true);
    cb(false);
  });
};
const Admin = mongoose.model("Admin", AdminSchema);
module.exports = Admin;
