var Routes = require("./index");
var express = require("express");
const router = express.Router();
router.use("/user", Routes.ClientRoutes);

router.use("/auth/user", Routes.ClientAuthRoutes);
router.use("/auth/companyUser", Routes.CompanyUserAuthRoutes);

module.exports = router;
