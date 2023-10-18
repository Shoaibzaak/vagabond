/**
 * Created by muddasir
 */

//import mongoose and models
var mongoose = require("mongoose");

const Model = require("../models/index");
const privacy = mongoose.model("PrivacyPolicy");

module.exports = {
  createPrivacy: async (data) => {
    console.log("createprivacy HelperFunction is called");
    const createPrivacy = new privacy(data);
    await createPrivacy.save();
    return createPrivacy;
  },
  findPrivacyById: async (query) => {
    console.log("get privacyhelperlist HelperFunction is called");
    const privacyUsers = await privacy.findOne(query.critarion);
    return privacyUsers;
  },
  getPrivacysWithFullDetails: async (
    sortProperty,
    sortOrder = -1,
    offset = 0,
    limit = 100000,
    query
  ) => {
    console.log("getPrivacysWithFullDetails Model Function called");

    const Privacy = await privacy.find()

      .sort({ [sortProperty]: sortOrder })
      .skip(offset)
      .limit(limit);
    const privacySize = Privacy.length;

    return {
      privacy: Privacy,
      count: privacySize,
      offset: offset,
      limit: limit,
    };
  },

  updatePrivacy: async (data) => {
    console.log("updatePrivacy HelperFunction is called");
    const id = await privacy.findOne(data.critarion)
    console.log(id,'id')
    const result = await Promise.all([
      privacy.findOneAndUpdate( { _id: id }, data, { new: true }),
    ]);
    return result;
  },

};
