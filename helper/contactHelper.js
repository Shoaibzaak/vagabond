/**
 * Created by zaki
 */

//import mongoose and models
var mongoose = require('mongoose')

const Model = require("../models/index");

const promise = require('bluebird');
const Job = mongoose.model('Job')
const Contact = mongoose.model('Query')

// //helper functions
// logger = require("./logger");

module.exports = {


    findContactById: async (query) => {
        console.log("findcontactById HelperFunction is called");

        const contactUsers = await Contact.findOne(query.critarion)

            .populate('businessId', query.businessFields)
            .populate('userId', query.userFields)

        return contactUsers;


    },
    createContact: async (data) => {
        console.log("createContact HelperFunction is called");
        const createContact = new Contact(data)
        await createContact.save()
        return createContact

    },

    getContactList: async (sortProperty, sortOrder = -1, offset = 0, limit = 100000, query) => {
        console.log("getcontact Model Function called")

        const contacts = await Contact.find().select(query.fields/* '_id contactName' */)

            .sort({ [sortProperty]: sortOrder })
            .skip(offset)
            .limit(limit);

        const contactsize = contacts.length

        return {
            contacts: contacts,
            count: contactsize,
            offset: offset,
            limit: limit
        };

    },
    getContactWithFullDetails: async (sortProperty, sortOrder = -1, offset = 0, limit = 100000, query) => {
        console.log("getcontactWithFullDetails Model Function called")

        const contact = await Contact.find()
            .populate('businessId')
            .populate('userId')

            .sort({ [sortProperty]: sortOrder })
            .skip(offset)
            .limit(limit)
            ;

        const contactsize = contact.length

        return {
            contact: contact,
            count: contactsize,
            offset: offset,
            limit: limit
        };

    },
};
