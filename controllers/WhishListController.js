const mongoose = require("mongoose");
const Model = require("../models/index");
const HTTPError = require("../utils/CustomError");
const responseHelper = require("../helper/response.helper");
const WhishlistHelper = require("../helper/whishList.helper");
const Status = require("../status");
const catchAsync = require("../utils/catchAsync");





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

    getAllWhishlistUsers: catchAsync(async (req, res, next) => {
        console.log("Wishlist details are called");
        try {
            const userId = req.user.id;
    
            const pageNumber = parseInt(req.query.pageNumber) || 0;
            const limit = parseInt(req.query.limit) || 10;
            
            // Determine the sort order based on the user's query parameter
            let sortQuery;
            const sortBy = req.query.sortBy;
            if (sortBy === 'date') {
                sortQuery = { createdAt: -1 }; // Newest first
            } else if (sortBy === 'name') {
                sortQuery = { place: 1 }; // Alphabetically
            } else {
                sortQuery = { _id: -1 }; // Default sorting by _id (or any other default you prefer)
            }
    
            var message = "Wishlist details found successfully";
    
            var wishlistItems = await Model.Whishlist.find({ userId: userId })
                .skip((pageNumber * limit) - limit)
                .limit(limit)
                .sort(sortQuery);
    
            const wishlistSize = wishlistItems.length;
    
            const result = {
                wishlist: wishlistItems,
                count: wishlistSize,
                limit: limit
            };
    
            if (wishlistSize === 0) {
                message = "Wishlist details do not exist for this user.";
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
            var updatedWhishlist = await Model.Whishlist.findOneAndUpdate(
                { _id: WhishlistUserData.WhishlistId },
                WhishlistUserData,
                {
                    new: true,
                }
            );
            if (!updatedWhishlist) {
                return res.notFound("Whishlist user not found");
            }
    
            var message = "Whishlist  status updated successfully";
            res.ok(message, updatedWhishlist);
        } catch (err) {
            throw new HTTPError(Status.INTERNAL_SERVER_ERROR, err);
        }
    }),

    // Delete a Whishlist user
    declineWhishlist: catchAsync(async (req, res, next) => {
        var WhishlistId = req.params.id
        try {
            const WhishlistUser = await Model.Whishlist.findByIdAndDelete({_id:WhishlistId})
            if (!WhishlistUser)
                return res.badRequest("Whishlist  Not Found in our records");
            var message = "Whishlist user deleted successfully";
            res.ok(message, WhishlistUser);
        } catch (err) {
            throw new HTTPError(Status.INTERNAL_SERVER_ERROR, err);
        }
    }),

};


