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


var upload = Multer({ //multer settings
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
router.route("/createWhishList").post(
  Authentication.UserAuth,
  Controller.WhishListController.createWhishlist);
//  get All whishlists
router.route("/getAllWhishList").get(
  Authentication.UserAuth,
  Controller.WhishListController.getAllWhishlistUsers);
  router.route("/updateWhishList").post(
    Authentication.UserAuth,
    Controller.WhishListController.updateWhishlist);

// delete whishlist
router.route("/declineWhishList/:id").delete(
  Authentication.UserAuth,
  Controller.WhishListController.declineWhishlist);


module.exports = router;



