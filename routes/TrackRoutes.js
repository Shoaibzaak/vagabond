const express = require("express");
const Controller = require("../controllers/index");
const router = express.Router();
const path = require("path");
const Multer = require("multer");
const Authentication = require("../policy/index");
const userStorage = Multer.diskStorage({
  // destination: (req, file, cb) => {
  //   cb(null, "./public/images");
  // },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});
// const storage = new Multer.memoryStorage();

var upload = Multer({
  //multer settings
  storage: userStorage,
  fileFilter: function (req, file, callback) {
    var ext = path.extname(file.originalname);
    if (ext !== ".png" && ext !== ".jpg" && ext !== ".gif" && ext !== ".jpeg") {
      return callback(new Error("Only images are allowed"));
    }
    callback(null, true);
  },
  limits: {
    fileSize: 1024 * 1024,
  },
});

//post Track
router
  .route("/createTrack")
  .post(Authentication.UserAuth, Controller.TrackerController.createTracker);

// get Track
router
  .route("/getTrack/:id")
  .get(Authentication.UserAuth, Controller.TrackerController.getTrackerUser);

// update Track
router
  .route("/updateTrack/:id")
  .put(Authentication.UserAuth, Controller.TrackerController.updateTracker);
router
  .route("/getAllTracks")
  .get(Authentication.UserAuth, Controller.TrackerController.getAllTracker);
  router
  .route("/deleteTracker/:id")
  .delete(Authentication.UserAuth, Controller.TrackerController.declineTrackere);

module.exports = router;
