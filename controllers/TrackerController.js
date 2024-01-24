const mongoose = require("mongoose");
const Model = require("../models/index");
const HTTPError = require("../utils/CustomError");
const responseHelper = require("../helper/response.helper");
const Status = require("../status");
const catchAsync = require("../utils/catchAsync");

module.exports = {
  // Retrieve Tracker user by TrackerId
  getTrackerUser: catchAsync(async (req, res, next) => {
    console.log("findTrackerById is called");
  }),

  // Create a new Tracker
  createTracker: catchAsync(async (req, res, next) => {
    console.log("createTracker is called");
    try {
      const { tripName, distance, locations, userId } = req.body;

      // Validate the request data
      if (!tripName || !distance || !locations || !userId) {
        return res.badRequest("Invalid request data");
      }

      // Create a new track instance
      const newTrack = new Model.Tracker({
        tripName,
        distance,
        locations,
        userId,
      });

      // Save the track to the database
      const savedTrack = await newTrack.save();
     // Send push notification to the user
      // If the user has completed the desired distance, send a notification
    //   if (completedDistance >= distance) {
    //     sendPushNotification(userId, `Congratulations! You have completed ${distance} miles for trip: ${tripName}`);
    //   }
  

      // Return the saved track as a response
      return res.ok("track created successfully", savedTrack);
    } catch (error) {
      return res.serverError(error?.message);
    }
  }),

  getAllTrackerUsers: catchAsync(async (req, res, next) => {
    console.log("Wishlist details are called");
  }),

  // Delete a Tracker user
  declineTracker: catchAsync(async (req, res, next) => {
    var TrackerId = req.params.id;
    try {
      const TrackerUser = await Model.Tracker.findByIdAndDelete({
        _id: TrackerId,
      });
      if (!TrackerUser)
        return res.badRequest("Tracker  Not Found in our records");
      var message = "Tracker user deleted successfully";
      res.ok(message, TrackerUser);
    } catch (err) {
      throw new HTTPError(Status.INTERNAL_SERVER_ERROR, err);
    }
  }),
};
