
//import mongoose and models
var mongoose = require('mongoose')

var Model = require("../models/index");

//bluebird for promise
const promise = require('bluebird');

module.exports = {
    // Job seeker WhishList

    createWhishList: async (data) => {
        console.log("createWhishList HelperFunction is called");
        const WhishList = new Model.Whishlist(data)
        await WhishList.save()
        return WhishList

    },
    getWhishListWithFullDetails: async (sortProperty, sortOrder = -1, offset = 0, limit = 100000, query) => {
        console.log("getWhishList Model Function called")

        const WhishLists = await Model.Whishlist.find().select('place')
            .sort({ [sortProperty]: sortOrder })
            .skip(offset)
            .limit(limit);

        const WhishListSize = WhishLists.length

        return {
            WhishLists: WhishLists,
            count: WhishListSize,
            offset: offset,
            limit: limit
        };

    },
    updateWhishList: async (data) => {
        console.log("updateWhishList HelperFunction is called");

        const result = await promise.all([Model.Whishlist.findOneAndUpdate({ _id: data.WhishListId }, data, { new: true })])
        return result;

    },


    findWhishListById: async (query) => {
        console.log("findWhishListById HelperFunction is called", query);

        const WhishList = await Model.Whishlist.findOne(query.critarion)
        // .populate({
        //     path: 'WhishListSubscription', populate: {
        //         path: "subscriptionId"
        //     },

        // })
   return WhishList;


    },




};
