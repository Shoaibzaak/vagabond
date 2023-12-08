const mongoose = require("mongoose");
const stripe = require("stripe")("sk_test_N8bwtya9NU0jFB5ieNazsfbJ");
const Model = require("../models/index");
const Validation = require("../validations/validation");
const Message = require("../Message");
const Services = require("../services");
const HTTPError = require("../utils/CustomError");
const responseHelper = require("../helper/response.helper");
const PinHelper = require("../helper/pin.helper");
const Status = require("../status");
const moment = require("moment");
const cloudUpload = require("../cloudinary");
const fs = require("fs");
const path = require("path");
const encrypt = require("bcrypt");
const FormData = require("form-data");
const catchAsync = require("../utils/catchAsync");
const getDistance = require("../utils/getDistance");
const pushRepository = require("./pushController");
const pushRepo = new pushRepository();

const { IDVClient } = require("yoti");
const SANDBOX_CLIENT_SDK_ID = "bbb23e67-b04c-4075-97f2-105c4559d46c";

module.exports = {
  // Retrieve Pin user by PinId
  getPinUser: catchAsync(async (req, res, next) => {
    console.log("findPinById is called");
    try {
      var pinId = req.params.id;
      console.log(pinId);

      var result = await Model.Pin.findById({ _id: pinId }).populate("userId");

      var message = "PinId found successfully";
      if (result == null) {
        message = "PinId does not exist.";
      }

      return responseHelper.success(res, result, message);
    } catch (error) {
      responseHelper.requestfailure(res, error);
    }
  }),

  // Create a new Pin
  createPin: catchAsync(async (req, res, next) => {
    console.log("createPin is called");

    try {
      var PinData = req.body;
      PinData.images = [];
      // if (Array.isArray(req.files.images)) {
      // for (let i = 0; i < req.files.images.length; i++) {
      //     const newPath = await cloudinary.uploader.upload(req.files.images[i].originalname,(result)=>{
      //         console.log(result,'result')
      //     })
      //     console.log(newPath, "newPath")
      //     PinData.images.push(newPath)

      // }
      // }

      PinData.images = [];
      const files = req.files.images;
      if (req.files.images) {
        for (const file of files) {
          const { path } = file;
          const newPath = await cloudUpload.cloudinaryUpload(path);
          PinData.images.push(newPath);
        }
      }
      var result = await PinHelper.createPin(PinData);

      var message = "Pin created successfully";
      if (result == null) {
        message = "Pin does not exist.";
      }

      return responseHelper.success(res, result, message);
    } catch (error) {
      responseHelper.requestfailure(res, error);
    }
  }),

  // Get a list of Pins
  getPinList: async (req, res) => {
    console.log("getPinList called");
    var PinData = req.body;

    try {
      var result = await PinHelper.getPinList(
        PinData.sortproperty,
        PinData.sortorder,
        PinData.offset,
        PinData.limit,
        PinData.query
      );

      var message = "Successfully loaded";

      responseHelper.success(res, result, message);
    } catch (err) {
      responseHelper.requestfailure(res, err);
    }
  },

  // Get all Pin users with full details
  getAllPinUsers: catchAsync(async (req, res, next) => {
    console.log("Pindetails is called");
    try {
      var PinData = req.body;

      var result = await PinHelper.getPinWithFullDetails(
        PinData.sortproperty,
        PinData.sortorder,
        PinData.offset,
        PinData.limit,
        PinData.query
      );

      var message = "Pindetails found successfully";
      if (result == null) {
        message = "Pindetails does not exist.";
      }

      return responseHelper.success(res, result, message);
    } catch (error) {
      responseHelper.requestfailure(res, error);
    }
  }),

  // Update a Pin user
  updatePin: catchAsync(async (req, res, next) => {
    // Get the Pin user data from the request body
    var PinUserData = req.body;
    try {
      PinUserData.images = [];
      const files = req.files.images;
      if (req.files.images) {
        for (const file of files) {
          const { path } = file;
          const newPath = await cloudUpload.cloudinaryUpload(path);
          PinUserData.images.push(newPath);
        }
      }
      // if (Array.isArray(req.files.images)) {
      //     for (let i = 0; i < req.files.images.length; i++) {
      //         PinUserData.images.push(`public/images/${req.files.images[i].originalname}`)

      //     }
      // }
      // Update the Pin user with the updated data
      var result = await Model.Pin.findOneAndUpdate(
        { _id: PinUserData.pinId },
        PinUserData,
        {
          new: true,
        }
      );
      var message = "Pin  status updated successfully";
      res.ok(message, result);
    } catch (err) {
      throw new HTTPError(Status.INTERNAL_SERVER_ERROR, err);
    }
  }),

  // Delete a Pin user
  declinePin: catchAsync(async (req, res, next) => {
    var PinId = req.params.id;
    try {
      const PinUser = await Model.Pin.findByIdAndDelete(PinId);
      if (!PinUser) return res.badRequest("Pin  Not Found in our records");
      var message = "Pin user deleted successfully";
      res.ok(message, PinUser);
    } catch (err) {
      throw new HTTPError(Status.INTERNAL_SERVER_ERROR, err);
    }
  }),
  // Delete a Pin user
  temporaryDeclinePin: catchAsync(async (req, res, next) => {
    var PinId = req.params.id;
    try {
      var result = await Model.Pin.findByIdAndDelete(
        { _id: PinId },
        { isDeleted: true },
        {
          new: true,
        }
      );
      var message = "Pin  status deleted successfully";
      res.ok(message, result);
    } catch (err) {
      throw new HTTPError(Status.INTERNAL_SERVER_ERROR, err);
    }
  }),

  // reset map
  resetMap: catchAsync(async (req, res, next) => {
    try {
      var result = await Model.Pin.updateMany(
        {},
        {
          $set: {
            isDeleted: true,
          },
        },

        {
          multi: true,
        }
      );
      var message = "reset map successfully";
      res.ok(message, result.message);
    } catch (err) {
      throw new HTTPError(Status.INTERNAL_SERVER_ERROR, err);
    }
  }),
  // Create a new Pin
  createCustomPin: catchAsync(async (req, res, next) => {
    console.log("createPin is called");

    try {
      var PinData = req.body;
      var result = await PinHelper.createPin(PinData);

      var message = "Pin created successfully";
      if (result == null) {
        message = "Pin does not exist.";
      }

      return responseHelper.success(res, result, message);
    } catch (error) {
      responseHelper.requestfailure(res, error);
    }
  }),

  uploadImage: catchAsync(async (req, res, next) => {
    console.log("uploadImage is called");

    try {
        const files = req.files.images;

        if (!files || !files.length) {
            throw new Error("No images were provided for upload.");
        }

        const newPathArray = await Promise.all(files.map(async (file) => {
            const { path } = file;
            return await cloudUpload.cloudinaryUpload(path);
        }));
        return responseHelper.success(res, { path: newPathArray }, "Images uploaded successfully");
    } catch (error) {
        console.error("Error during image upload:", error);
        responseHelper.requestfailure(res, error);
    }
}),

};
