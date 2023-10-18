/**
 * Created by muddasir
 */

//import mongoose and models
var mongoose = require("mongoose");

const Model = require("../models/index");
const Cookie = mongoose.model("CookiePolicy");

module.exports = {
  createCookie: async (data) => {
    console.log("createCookie HelperFunction is called");
    const createCookie = new Cookie(data);
    await createCookie.save();
    return createCookie;
  },
  findCookieById: async (query) => {
    console.log("get Cookiehelperlist HelperFunction is called");
    const CookieUsers = await Cookie.findOne(query.critarion);
    return CookieUsers;
  },
  getPrivacysWithFullDetails: async (
    sortProperty,
    sortOrder = -1,
    offset = 0,
    limit = 100000,
    query
  ) => {
    console.log("getcookieWithFullDetails Model Function called");

    const privacy = await Cookie.find()

      .sort({ [sortProperty]: sortOrder })
      .skip(offset)
      .limit(limit);
    const sectortsize = privacy.length;

    return {
      privacy: privacy,
      count: sectortsize,
      offset: offset,
      limit: limit,
    };
  }, 
  updateCookie: async (data) => {
    console.log("updateCookie HelperFunction is called");

    const result = await Promise.all([
      Cookie.findOneAndUpdate( data.critarion , data, { new: true }),
    ]);
    return result;
  },
};
