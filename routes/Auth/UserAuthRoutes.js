const express = require("express");
const Controller = require("../../controllers/index");
const router = express.Router();
const path = require("path");
const Multer = require("multer");
const fs = require('fs');
const Authentication = require("../../policy/index");

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

router.route("/register").post(Controller.UserAuthController.register);
router.route("/getUserProfile/:id").get(Authentication.UserAuth,Controller.UserAuthController.getUser);
router.route("/updateUser").post(Authentication.UserAuth,Controller.UserAuthController.updateUser);
router.route("/accontVerification").post(Controller.UserAuthController.accountVerification);
router.route("/login").post(Controller.UserAuthController.login);
router.route("/forgetpassword").post(Controller.UserAuthController.forgetPassword);
router.route("/changepassword").post(Authentication.UserAuth,Controller.UserAuthController.changePassword);
router.route("/resendOtp").post(Controller.UserAuthController.resendOtp);
router.route("/updatePassword").post(Controller.UserAuthController.updatePassword);
router.route("/createContact").post(Controller.UserAuthController.createContact);
router.route("/temporaryDeclineAccount").put( Authentication.UserAuth,Controller.UserAuthController.temporaryDeclineAccount);
router.route("/declineAccount/:id").delete(Controller.UserAuthController.declineAccount);
router.route("/uploadProfilePic").post(
  upload.fields([
    {
      name: "profilePic",
      maxCount: 1,
    }
  ]),
  Controller.UserAuthController.uploadProfilePic
);

module.exports = router;
