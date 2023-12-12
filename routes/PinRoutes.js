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

//post custom pin
router.route("/createPin").post(
  upload.fields([
    {
      name: "images",
      maxCount: 10,
    },
  ]),
  Authentication.UserAuth,
  Controller.PinController.createPin
);

//post custom pin
router
  .route("/createCustomPin")
  .post(Authentication.UserAuth, Controller.PinController.createCustomPin);
//update pin
router.route("/updatePin").post(
  Authentication.UserAuth,
  Controller.PinController.updatePin
);

//delete pin
router
  .route("/deletePin/:id")
  .delete(Authentication.UserAuth, Controller.PinController.declinePin);

// get pin by id
router
  .route("/findPinById/:id")
  .get(Authentication.UserAuth, Controller.PinController.getPinUser);

// get all  pins with details
router
  .route("/getAllPins")
  .get(Authentication.UserAuth, Controller.PinController.getAllPinUsers);

//delete pin temporary
router
  .route("/temporaryDeletePin/:id")
  .delete(
    Authentication.UserAuth,
    Controller.PinController.temporaryDeclinePin
  );

//reset map functionality
router
  .route("/resetMap")
  .get(Authentication.UserAuth, Controller.PinController.resetMap);
  //reset map functionality
router
.route("/uploadImage")
.post(
  upload.fields([
    {
      name: "images",
      maxCount: 10,
    },
  ]),
  Authentication.UserAuth, 
  Controller.PinController.uploadImage);

module.exports = router;
