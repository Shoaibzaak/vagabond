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
const upload = multer({ storage: userStorage });
//post custom pin 
router.route("/createPin").post(
  upload.fields([
    {
      name: "images",
      maxCount: 1,
    },
  ]),
  Authentication.UserAuth,
  Controller.PinController.createPin);

//update pin
router.route("/updatePin").post(
  Authentication.UserAuth,
  Controller.PinController.updatePin);

// get pin by id
router.route("/findPinById/:id").get(
  Authentication.UserAuth,
  Controller.PinController.getPinUser);



module.exports = router;



