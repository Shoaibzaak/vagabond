const express = require("express");
const Controller = require("../controllers/index");
const router = express.Router();
const path = require("path");
const multer = require("multer");
const Authentication = require("../policy/index");

const userStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/images");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

var upload = multer({ //multer settings
  storage: userStorage,
  fileFilter: function (req, file, callback) {
    var ext = path.extname(file.originalname);
    if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
      return callback(new Error('Only images are allowed'))
    }
    callback(null, true)
  },
  limits: {
    fileSize: 1024 * 1024
  }
})

//post custom pin 
router.route("/createPin").post(
  upload.fields([
    {
      name: "images",
      maxCount: 10,
    },
  ]),
  Authentication.UserAuth,
  Controller.PinController.createPin);

//update pin
router.route("/updatePin").post(
  Authentication.UserAuth,
  Controller.PinController.updatePin);

//delete pin
router.route("/deletePin/:id").delete(
  Authentication.UserAuth,
  Controller.PinController.declinePin);


// get pin by id
router.route("/findPinById/:id").get(
  Authentication.UserAuth,
  Controller.PinController.getPinUser);



module.exports = router;



