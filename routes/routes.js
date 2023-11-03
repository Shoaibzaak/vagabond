var Routes = require("./index");
var express = require("express");
const router = express.Router();
router.use("/auth/user", Routes.UserAuthRoutes);
router.use("/pin", Routes.PinRoutes);
router.use("/whishList", Routes.WhishListRoutes);

module.exports = router;
