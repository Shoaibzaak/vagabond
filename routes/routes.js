var Routes = require("./index");
var express = require("express");
const router = express.Router();
router.use("/auth/user", Routes.UserAuthRoutes);
router.use("/pin", Routes.PinRoutes);

module.exports = router;
