var Routes = require("./index");
var express = require("express");
const router = express.Router();
router.use("/auth/user", Routes.UserAuthRoutes);
router.use("/pin", Routes.PinRoutes);
router.use("/whishList", Routes.WhishListRoutes);
router.use("/category", Routes.CategoryRoutes);
router.use("/shade", Routes.ShadeRoutes);

module.exports = router;
