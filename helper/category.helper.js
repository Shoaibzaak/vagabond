
//import mongoose and models
var mongoose = require('mongoose')

var Model = require("../models/index");

//bluebird for promise
const promise = require('bluebird');

module.exports = {
    // Job seeker Category

    createCategory: async (data) => {
        console.log("createCategory HelperFunction is called");
        const Category = new Model.Category(data)
        await Category.save()
        return Category

    },
    getCategoryWithFullDetails: async (sortProperty, sortOrder = -1, offset = 0, limit = 100000, query) => {
        console.log("getCategory Model Function called")

        const Categorys = await Model.Category.find().select('place')
            .sort({ [sortProperty]: sortOrder })
            .skip(offset)
            .limit(limit);

        const CategorySize = Categorys.length

        return {
            Categorys: Categorys,
            count: CategorySize,
            offset: offset,
            limit: limit
        };

    },
    updateCategory: async (data) => {
        console.log("updateCategory HelperFunction is called");

        const result = await promise.all([Model.Category.findOneAndUpdate({ _id: data.CategoryId }, data, { new: true })])
        return result;

    },


    findCategoryById: async (IDVClient) => {
        console.log("findCategoryById HelperFunction is called", id);

        const Category = await Model.Category.findById(id)
        // .populate({
        //     path: 'CategorySubscription', populate: {
        //         path: "subscriptionId"
        //     },

        // })
   return Category;


    },




};
