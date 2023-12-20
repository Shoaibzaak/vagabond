const mongoose = require("mongoose");
const stripe = require("stripe")("sk_test_N8bwtya9NU0jFB5ieNazsfbJ");
const Model = require("../models/index");
const Validation = require("../validations/validation");
const Message = require("../Message");
const Services = require("../services");
const HTTPError = require("../utils/CustomError");
const responseHelper = require("../helper/response.helper");
const CategoryHelper = require("../helper/category.helper");
const Status = require("../status");
const moment = require("moment");
const cloudUpload = require("../cloudinary");
const fs = require("fs");
const path = require("path");
const encrypt = require("bcrypt");
const FormData = require("form-data");
const catchAsync = require("../utils/catchAsync");
const getDistance = require("../utils/getDistance");
const pushRepository = require("./pushController");
const pushRepo = new pushRepository();

module.exports = {
  // Retrieve Category user by CategoryId
  getCategoryUser: catchAsync(async (req, res, next) => {
    console.log("findCategoryById is called");
    try {
      var CategoryId = req.params.id;
      console.log(CategoryId);

      var result = await CategoryHelper.findCategoryById(CategoryId);

      var message = "CategoryId found successfully";
      if (result == null) {
        message = "CategoryId does not exist.";
      }

      return responseHelper.success(res, result, message);
    } catch (error) {
      responseHelper.requestfailure(res, error);
    }
  }),

  // Create a new Category
  createCategory: catchAsync(async (req, res, next) => {
    console.log("createCategory is called");

    try {
      var CategoryData = req.body;

      var result = await CategoryHelper.createCategory(CategoryData);

      var message = "Category created successfully";
      if (result == null) {
        message = "Category does not exist.";
      }

      return responseHelper.success(res, result, message);
    } catch (error) {
      responseHelper.requestfailure(res, error);
    }
  }),

  // Get all Category users with full details
  getAllCategoryUsers: catchAsync(async (req, res, next) => {
    console.log("Categorydetails is called");
    try {
      // var CategoryData = req.body;

      // var result = await CategoryHelper.getCategoryWithFullDetails(CategoryData.sortproperty, CategoryData.sortorder, CategoryData.offset, CategoryData.limit, CategoryData.query);
      const pageNumber = parseInt(req.query.pageNumber) || 0;
      const limit = parseInt(req.query.limit) || 10;
      var message = "Categorydetails found successfully";
      var Categorys = await Model.Category.find({categoryType:'PRIVATE'})
        .skip(pageNumber * limit - limit)
        .limit(limit)
        .sort("-_id");
      const CategorySize = Categorys.length;
      const result = {
        Category: Categorys,
        count: CategorySize,
        limit: limit,
      };
      if (result == null) {
        message = "Categorydetails does not exist.";
      }
      return responseHelper.success(res, result, message);
    } catch (error) {
      responseHelper.requestfailure(res, error);
    }
  }),

  // Update a Category user
  updateCategory: catchAsync(async (req, res, next) => {
    // Get the Category user data from the request body
    const categoryUserData = req.body;
    try {
      // Update the Category user with the updated data, only if categoryType is PRIVATE
      const result = await Model.Category.findOneAndUpdate(
        { _id: categoryUserData.CategoryId, categoryType: "PRIVATE" },
        categoryUserData,
        { new: true }
      );

      if (!result) {
        return res.badRequest("Category Not Found or not of type PRIVATE");
      }

      const message = "Category status updated successfully";
      res.ok(message, result);
    } catch (err) {
      throw new HTTPError(Status.INTERNAL_SERVER_ERROR, err);
    }
  }),

  declineCategory: catchAsync(async (req, res, next) => {
    const categoryId = req.params.id;
    try {
      const deletedCategoryUser = await Model.Category.findOneAndDelete({
        _id: categoryId,
        categoryType: "PRIVATE",
      });

      if (!deletedCategoryUser) {
        return res.badRequest("Category Not Found or not of type PRIVATE");
      }

      const message = "Category user deleted successfully";
      res.ok(message, deletedCategoryUser);
    } catch (err) {
      throw new HTTPError(Status.INTERNAL_SERVER_ERROR, err);
    }
  }),
};
