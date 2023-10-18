const express = require("express");
const Controller = require("../../controllers/index");
const router = express.Router();
const path = require("path");
const multer = require("multer");
const fs = require('fs');
const userStorage = multer.diskStorage({
  destination: (req, file, cb) => {
      // Check if the directory exists, if not create it
      if (!fs.existsSync('uploads/')) {
        fs.mkdirSync('uploads/');
      }
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});
const upload = multer({ storage: userStorage });

router.route("/register").post(Controller.ClientAuthController.register);


router.route("/login").post(Controller.ClientAuthController.login);

router.route("/forgetpassword").post(Controller.ClientAuthController.forgetPassword);
router.route("/changepassword").post(Controller.ClientAuthController.changePassword);

// router.route("/profile/setup").post(
//   upload.fields([
//     {
//       name: "profilePic",
//       maxCount: 1,
//     },
//     {
//       name: "resume",
//       maxCount: 1,
//     },
//   ]),
//   Controller.AuthController.setupProfile
// );

module.exports = router;
