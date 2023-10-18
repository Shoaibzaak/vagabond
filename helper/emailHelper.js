/**
 * Created by zaki
 */

//import mongoose and models
var mongoose = require('mongoose')

const Model = require("../models/index");
//bluebird for promises
const promise = require('bluebird');

// //helper functions
// logger = require("./logger");

module.exports = {


    findEmailById: async (query) => {
        console.log("findEmailById HelperFunction is called");
        // query.critarion
        const EmailUser = await Model.Notification.aggregate([
             { $match: { _id: mongoose.Types.ObjectId(query.critarion._id) } },
            
            {

                $lookup: {
                    from: 'users',
                    localField: 'senderId',
                    foreignField: '_id',
                    as: 'JobSeeker'
                },
            }, {

                $lookup: {
                    from: 'businessusers',
                    localField: 'recipientId',
                    foreignField: '_id',
                    as: 'Business'
                },

            }])

        return EmailUser;


    },
    createEmailReviews: async (data) => {
        console.log("createEmailReviews HelperFunction is called");
        const createEmail = new Model.Notification(data)
        await createEmail.save()
        return createEmail

    },

    getEmailsWithFullDetails: async (sortProperty, sortOrder = -1, offset = 0, limit = 100000, query) => {
        console.log("getEmailWithFullDetails Model Function called")

        const Email = await Model.Notification.aggregate([{

            $lookup: {
                from: 'users',
                localField: 'senderId',
                foreignField: '_id',
                as: 'JobSeeker'
            },
        }, {

            $lookup: {
                from: 'businessusers',
                localField: 'recipientId',
                foreignField: '_id',
                as: 'Business'
            },

        }])
            .sort({ [sortProperty]: sortOrder })
            .skip(offset)
            .limit(limit)
            ;

        const Emailsize = Email.length

        return {
            Email: Email,
            count: Emailsize,
            offset: offset,
            limit: limit
        };

    },

   
    getEmailList: async (sortProperty, sortOrder = -1, offset = 0, limit = 100000, query) => {
        console.log("getEmailList Model Function called")

        const Email = await Model.Notification.find().select(query.fields/* '_id businesName' */)

            .sort({ [sortProperty]: sortOrder })
            .skip(offset)
            .limit(limit);

        const Emailize = Email.length

        return {
            Email: Email,
            count: Emailize,
            offset: offset,
            limit: limit
        };

    },

    updateEmail: async (data) => {
        console.log("updateEmail HelperFunction is called");

        const result = await promise.all([Model.Notification.findOneAndUpdate({ _id: data.notificationId }, data, { new: true })])
        return result;

    },

};
