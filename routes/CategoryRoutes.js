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

//post category  
router.route("/createCategory").post(
  Authentication.UserAuth,
  Controller.CategoryController.createCategory);
  //update category 
router.route("/updateCategory").post(
    Authentication.UserAuth,
    Controller.CategoryController.updateCategory);
//  get All category
router.route("/getAllCategory").get(
  Authentication.UserAuth,
  Controller.CategoryController.getAllCategoryUsers);

// delete ategory
router.route("/declineCategory/:id").delete(
  Authentication.UserAuth,
  Controller.CategoryController.declineCategory);


module.exports = router;



