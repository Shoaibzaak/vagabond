const mongoose = require("mongoose");
const stripe = require("stripe")("sk_test_N8bwtya9NU0jFB5ieNazsfbJ");
const Model = require("../models/index");
const Validation = require("../validations/validation");
const Message = require("../Message");
const Services = require("../services");
const HTTPError = require("../utils/CustomError");
const responseHelper = require("../helper/response.helper");
const Status = require("../status");
const moment = require("moment");
const cloudUpload = require("../cloudinary");
const fs = require("fs");
const path = require("path");
const encrypt = require("bcrypt");
const FormData = require("form-data");
const catchAsync = require("../utils/catchAsync");
const pushRepository = require("./pushController");
const pushRepo = new pushRepository();

module.exports = {
  // Retrieve Shade user by ShadeId
  getShadeUser: catchAsync(async (req, res, next) => {
    console.log("findShadeById is called");
    try {
      var ShadeId = req.params.id;
      console.log(ShadeId);

      const result = await Model.Shade.findById(ShadeId);

      var message = "ShadeId found successfully";
      if (result == null) {
        message = "ShadeId does not exist.";
      }

      return responseHelper.success(res, result, message);
    } catch (error) {
      responseHelper.requestfailure(res, error);
    }
  }),

  // Create a new Shade
  createShade: catchAsync(async (req, res, next) => {
    console.log("createShade is called");

    try {
      const ShadeData = req.body;

      const newShade = new Model.Shade(ShadeData);
      const savedShade = await newShade.save();

      if (!savedShade) {
        return responseHelper.error(res, 500, "Failed to create Shade");
      }

      return responseHelper.success(
        res,
        savedShade,
        "Shade created successfully"
      );
    } catch (error) {
      // Log detailed error for debugging
      console.error("Error in createShade:", error);

      // Handle error response
      return responseHelper.requestfailure(res, error);
    }
  }),

  getAllShadeUsers: catchAsync(async (req, res, next) => {
    console.log("Shadedetails is called");
    try {
      const userId = req.user.id; // Assuming the user ID is available in the request
      var message = "Shadedetails found successfully";

      // Static data
      const usaStatesCount = 50;
      const totalWorldCountriesCount = 195; // This is an approximation; the actual number might vary

      // Retrieve states based on query parameters
      const countryName = req.query.countryName;

      let Shades;

      if (countryName === "USA") {
        // If countryName is provided, retrieve all documents with that countryName
        Shades = await Model.Shade.find({
          state: { $exists: true },
          userId: userId,
        });
      } else if (countryName === "Others") {
        // If state is provided, retrieve all documents with that state
        Shades = await Model.Shade.find({
          state: { $exists: false },
          userId: userId,
        });
      } else {
        return responseHelper.badRequest(
          res,
          "Invalid countryName. Please provide 'USA' or 'Others'."
        );
      }
      const ShadeSize = Shades.length;
      const result = {
        Shade: Shades,
        count: ShadeSize,
        usaStatesCount: countryName === "USA" ? usaStatesCount : null,
        totalWorldCountriesCount:
          countryName === "Others" ? totalWorldCountriesCount : null,
        usaStatesPercentage:
          countryName === "USA" ? (ShadeSize / usaStatesCount) * 100 : null,
        totalWorldCountriesPercentage:
          countryName === "Others"
            ? (ShadeSize / totalWorldCountriesCount) * 100
            : null,
      };

      if (ShadeSize === 0) {
        message = "Shadedetails does not exist.";
      }

      return responseHelper.success(res, result, message);
    } catch (error) {
      responseHelper.requestfailure(res, error);
    }
  }),

  // Update a Shade user
  updateShade: catchAsync(async (req, res, next) => {
    // Get the Shade user data from the request body
    const ShadeUserData = req.body;
    try {
      // Update the Shade user with the updated data, only if ShadeType is PRIVATE
      const result = await Model.Shade.findOneAndUpdate(
        { _id: ShadeUserData.ShadeId },
        ShadeUserData,
        { new: true }
      );

      if (!result) {
        return res.badRequest("Shade Not Found or not of type PRIVATE");
      }

      const message = "Shade status updated successfully";
      res.ok(message, result);
    } catch (err) {
      throw new HTTPError(Status.INTERNAL_SERVER_ERROR, err);
    }
  }),

  declineShade: catchAsync(async (req, res, next) => {
    const ShadeId = req.params.id;
    try {
      const deletedShadeUser = await Model.Shade.findOneAndDelete({
        _id: ShadeId,
        ShadeType: "PRIVATE",
      });

      if (!deletedShadeUser) {
        return res.badRequest("Shade Not Found or not of type PRIVATE");
      }

      const message = "Shade user deleted successfully";
      res.ok(message, deletedShadeUser);
    } catch (err) {
      throw new HTTPError(Status.INTERNAL_SERVER_ERROR, err);
    }
  }),
};
