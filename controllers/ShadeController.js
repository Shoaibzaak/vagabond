const mongoose = require("mongoose");
const stripe = require("stripe")("sk_test_N8bwtya9NU0jFB5ieNazsfbJ");
const Model = require("../models/index");
const HTTPError = require("../utils/CustomError");
const responseHelper = require("../helper/response.helper");
const Status = require("../status");
const FormData = require("form-data");
const catchAsync = require("../utils/catchAsync");

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
      const shadeData = req.body;
      const { countryName, color, location, userId, state } = shadeData;
      // Check if a shade with the same countryName and userId exists
      const existingShade = await Model.Shade.findOne({ countryName, userId });
      const existingState = state
        ? await Model.Shade.findOne({ state, userId })
        : null;

      if (existingShade && !state) {
        // Update existing shade with the new color
        existingShade.color = color;
        existingShade.location = location;
        const updatedShade = await existingShade.save();

        return responseHelper.success(
          res,
          updatedShade,
          "Shade updated successfully"
        );
      } else if (existingState && state) {
        // Update existing shade with the new color
        existingState.color = color;
        existingState.location = location;
        const updatedState = await existingState.save();

        return responseHelper.success(
          res,
          updatedState,
          "Shade in state updated successfully"
        );
      } else {
        // Create a new shade if it doesn't exist
        const newShade = new Model.Shade(shadeData);
        const savedShade = await newShade.save();

        if (!savedShade) {
          return responseHelper.error(res, 500, "Failed to create Shade");
        }

        return responseHelper.success(
          res,
          savedShade,
          "Shade created successfully"
        );
      }
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
      let AllShades;
      if (countryName === "USA") {
        // Retrieve all documents with states for the USA
        Shades = await Model.Shade.find({
          userId: userId,
          state: { $exists: true },
        });
      } else {
        // Retrieve all documents for countries other than the USA and exclude those with the state field
        var ShadeCountrySize = await Model.Shade.find({
          userId: userId,
          state: { $exists: false },
        });
        AllShades = await Model.Shade.find({
          userId: userId,
        });
      }

      const ShadeSize = Shades ? Shades.length : ShadeCountrySize.length;
      console.log(ShadeSize, "ShadeSize");
      const dataShades = Shades ? Shades : AllShades;
      const result = {
        Shade: dataShades,
        count: ShadeSize,
        usaStatesCount: countryName === "USA" ? usaStatesCount : null,
        countriesCount: !countryName ? totalWorldCountriesCount : null,
        totalWorldCountriesPercentage:
          countryName === "USA"
            ? null
            : ((ShadeSize / totalWorldCountriesCount) * 100).toFixed(2),
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
