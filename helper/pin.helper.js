
//import mongoose and models
var mongoose = require('mongoose')

var Model = require("../models/index");

//bluebird for promise
const promise = require('bluebird');

module.exports = {
    // Job seeker Pin

    createPin: async (data) => {
        console.log("createPin HelperFunction is called");
        const Pin = new Model.Pin(data)
        await Pin.save()
        return Pin

    },
    getPinWithFullDetails: async (sortProperty, sortOrder = -1, offset = 0, limit = 100000, query) => {
        console.log("getPin Model Function called")

        const Pins = await Model.Pin.find(query.critarion)

        // .populate({
        //     path: 'PinSubscription', 
        //     populate: {
        //         path: "subscriptionId"
        //     },
        // })
        //     .populate('sectors.sector')
            .sort({ [sortProperty]: sortOrder })
            .skip(offset)
            .limit(limit);

        const PinSize = Pins.length

        return {
            Pins: Pins,
            count: PinSize,
            offset: offset,
            limit: limit
        };

    },

    getPinList: async (sortProperty, sortOrder = -1, offset = 0, limit = 100000, query) => {
        console.log("getPin Model Function called")

        const Pins = await Model.Pin.find(query.critarion).select(query.fields/* '_id HotelName' */)

            .sort({ [sortProperty]: sortOrder })
            .skip(offset)
            .limit(limit);

        const PinSize = Pins.length

        return {
            Pins: Pins,
            count: PinSize,
            offset: offset,
            limit: limit
        };

    },


    updatePin: async (data) => {
        console.log("updatePin HelperFunction is called");

        const result = await promise.all([Model.Pin.findOneAndUpdate({ _id: data.PinId }, data, { new: true })])
        return result;

    },

   

    removePin: async (data) => {
        console.log("removePin HelperFunction is called");

        const Pin = await Model.Pin.findById(data.id);
        if (Pin == null) {
            var error = "Pin does not exists."
            return error
        }
        Pin.lastModifiedBy = data.lastModifiedBy
        Pin.isActive = false
        Pin.save()
        return hotel;


    },

    findPinById: async (query) => {
        console.log("findPinById HelperFunction is called");

        const Pin = await Model.Pin.findOne(query.critarion)
            // .populate({
            //     path: 'PinSubscription', populate: {
            //         path: "subscriptionId"
            //     },
               
            // })
        


        return Pin;


    },




};
