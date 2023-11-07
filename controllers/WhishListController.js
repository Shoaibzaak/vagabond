const mongoose = require("mongoose");
const stripe = require("stripe")("sk_test_N8bwtya9NU0jFB5ieNazsfbJ");
const Model = require("../models/index");
const Validation = require("../validations/validation");
const Message = require("../Message");
const Services = require("../services");
const HTTPError = require("../utils/CustomError");
const responseHelper = require("../helper/response.helper");
const WhishlistHelper = require("../helper/whishList.helper");
const Status = require("../status");
const moment = require("moment");
const cloudUpload = require('../cloudinary')
const fs = require("fs");
const path = require("path");
const encrypt = require("bcrypt");
const FormData = require('form-data');
const catchAsync = require("../utils/catchAsync");
const getDistance = require("../utils/getDistance");
const pushRepository = require("./pushController");
const pushRepo = new pushRepository();




module.exports = {

    // Retrieve Whishlist user by WhishlistId
    getWhishlistUser: catchAsync(async (req, res, next) => {
        console.log("findWhishlistById is called");
        try {
            var WhishlistId = req.params.id;
            console.log(WhishlistId)

            var result = await WhishlistHelper.findWhishListById(WhishlistId);

            var message = "WhishlistId found successfully";
            if (result == null) {
                message = "WhishlistId does not exist.";
            }

            return responseHelper.success(res, result, message);
        } catch (error) {
            responseHelper.requestfailure(res, error);
        }
    }),

    // Create a new Whishlist
    createWhishlist: catchAsync(async (req, res, next) => {
        console.log("createWhishlist is called");

        try {
            var WhishlistData = req.body;

            var result = await WhishlistHelper.createWhishList(WhishlistData);

            var message = "Whishlist created successfully";
            if (result == null) {
                message = "Whishlist does not exist.";
            }

            return responseHelper.success(res, result, message);
        } catch (error) {
            responseHelper.requestfailure(res, error);
        }
    }),


    // Get all Whishlist users with full details
    getAllWhishlistUsers: catchAsync(async (req, res, next) => {
        console.log("Whishlistdetails is called");
        try {
            // var WhishlistData = req.body;

            // var result = await WhishlistHelper.getWhishListWithFullDetails(WhishlistData.sortproperty, WhishlistData.sortorder, WhishlistData.offset, WhishlistData.limit, WhishlistData.query);
            const pageNumber = parseInt(req.query.pageNumber) || 0;
            const limit = parseInt(req.query.limit) || 10;
            var message = "Whishlistdetails found successfully";
            var whishLists = await Model.Whishlist.find()
                .skip((pageNumber * limit) - limit)
                .limit(limit)
                .sort("-_id")
                ;

            const whishListSize = whishLists.length
            const result = {
                whishList: whishLists,
                count: whishListSize,
                limit: limit
            }
            if (result == null) {
                message = "Whishlistdetails does not exist.";
            }
            return responseHelper.success(res, result, message);
        } catch (error) {
            responseHelper.requestfailure(res, error);
        }
    }),

    // Update a Whishlist user
    updateWhishlist: catchAsync(async (req, res, next) => {
        // Get the Whishlist user data from the request body
        var WhishlistUserData = req.body;
        try {

            // Update the Whishlist user with the updated data
            var result = await Model.Whishlist.findOneAndUpdate(
                { _id: WhishlistUserData.WhishlistId },
                WhishlistUserData,
                {
                    new: true,
                }
            );
            var message = "Whishlist  status updated successfully";
            res.ok(message, result);
        } catch (err) {
            throw new HTTPError(Status.INTERNAL_SERVER_ERROR, err);
        }
    }),

    // Delete a Whishlist user
    declineWhishlist: catchAsync(async (req, res, next) => {
        var WhishlistId = req.params.id
        try {
            const WhishlistUser = await Model.Whishlist.findOneAndDelete({_id:WhishlistId})
            if (!WhishlistUser)
                return res.badRequest("Whishlist  Not Found in our records");
            var message = "Whishlist user deleted successfully";
            res.ok(message, WhishlistUser);
        } catch (err) {
            throw new HTTPError(Status.INTERNAL_SERVER_ERROR, err);
        }
    }),

};


