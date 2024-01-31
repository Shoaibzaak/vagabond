const mongoose = require("mongoose");
const Model = require("../models/index");
const HTTPError = require("../utils/CustomError");
const responseHelper = require("../helper/response.helper");
const Status = require("../status");
const catchAsync = require("../utils/catchAsync");

module.exports = {
  // Retrieve Tracker user by TrackerId
  getTrackerUser: catchAsync(async (req, res, next) => {
    try {
      var TrackerId = req.params.id;
      console.log(TrackerId);

      const result = await Model.Tracker.findById(TrackerId);

      var message = "TrackerId found successfully";
      if (result == null) {
        message = "TrackerId does not exist.";
      }

      return responseHelper.success(res, result, message);
    } catch (error) {
      responseHelper.requestfailure(res, error);
    }
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


// Update a Tracker user
updateTracker: catchAsync(async (req, res, next) => {
  var TrackerId = req.params.id;
  try {
    // Assuming req.body contains the updated information for the Tracker user
    const updatedTrackerUser = await Model.Tracker.findByIdAndUpdate(
      TrackerId,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedTrackerUser)
      return res.badRequest("Tracker Not Found in our records");

    var message = "Tracker user updated successfully";
    res.ok(message, updatedTrackerUser);
  } catch (err) {
    throw new HTTPError(Status.INTERNAL_SERVER_ERROR, err);
  }
}),

};
