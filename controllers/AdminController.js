const stripe = require("stripe")(
  "sk_test_N8bwtya9NU0jFB5ieNazsfbJ"
);
const mongoose = require("mongoose");
var Model = require("../models/index");
var Validation = require("../validations/validation");
var Message = require("../Message");
var Services = require("../services/index");
const HTTPError = require("../utils/CustomError");
const Status = require("../status");
const moment = require("moment");
const catchAsync = require("../utils/catchAsync");
const fs = require("fs");

const userHelper = require('../helper/user.helper');

module.exports = {
  register: async (req, res, next) => {
    try {
      const { name, email, mobileNumber, password } = req.body;
      const Admin = new Model.Admin({
        name,
        email,
        mobileNumber,
        password
      });
      const user = await Model.Admin.findOne({ email });
      if (user) throw new HTTPError(Status.BAD_REQUEST, Message.badRequest);
      await Admin.save();
      res.ok("Registration successful", null);
    } catch (err) {
      next(err);
    }
  },

  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;
      if (!email || !password)
        throw new HTTPError(Status.BAD_REQUEST, Message.badRequest);
      const user = await Model.Admin.findOne({ email });
      if (!user) throw new HTTPError(Status.NOT_FOUND, Message.userNotFound);
      user.comparePassword(password, async(match) => {
        try {
          if (match) {
        
            user.set(
              "token",
              "GHA " + Services.JwtService.issue({ id: user._id }),
              { strict: false }
            );
            await Model.Admin.findOneAndUpdate({ email  }, {$set: { isloggedIn: true}});
            user.isloggedIn = true;
            return res.ok("Login successful", user);
          } else {
            throw new HTTPError(
              Status.UNAUTHORIZED,
              Message.invalidCredentials
            );
          }
        } catch (err) {
          next(err);
        }
      });
    } catch (err) {
      console.log(err);
      next(err);
    }
  },
  logout: catchAsync(async (req, res, next) => {
    try {
      const adminId = req.user._id;

      // Find the admin user by ID
      const admin = await Model.Admin.findById(adminId).lean();

      if (!admin) {
        throw new HTTPError(Status.NOT_FOUND, "Admin user not found");
      }

      // Update the isLoggedIn field to false
      await Model.Admin.findOneAndUpdate({ _id: admin._id  }, {$set: { isloggedIn: false}});
      return res.status(200).json({
        status: "Success",
        message: "Logout successful",
      });
    } catch (err) {
      next(err);
    }
  }),

  

};
