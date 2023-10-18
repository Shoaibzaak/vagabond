/**
 * Created by zaki
 */

//import mongoose and models
var mongoose = require('mongoose')

const Model = require("../models/index");

const promise = require('bluebird');
const Job = mongoose.model('Job')
const Chat = mongoose.model('Message')

// //helper functions
// logger = require("./logger");

module.exports = {

   
    findChatById: async (query) => {
        
        console.log("findChatById HelperFunction is called");

         const ChatUsers = await Chat.aggregate([
            // { $match: { _id: mongoose.Types.ObjectId(query.critarion._id) } },
            {
                $match: {
                  $or: [
                    { sentBy: mongoose.Types.ObjectId(query.critarion.adminId), sentTo: mongoose.Types.ObjectId(query.critarion.otherUserId) },
                    { sentBy: mongoose.Types.ObjectId(query.critarion.otherUserId), sentTo: mongoose.Types.ObjectId(query.critarion.adminId) },
                  ],
                },
              },
              {
                $lookup: {
                  from: 'users',
                  localField: 'sentBy',
                  foreignField: '_id',
                  as: 'sentBy_user'
                }
              },
        
              {
                $lookup: {
                  from: 'businessusers',
                  localField: 'sentBy',
                  foreignField: '_id',
                  as: 'sentBy_business'
                }
              },
            {
                $lookup: {
                    from: 'users',
                    localField: 'sentTo',
                    foreignField: '_id',
                    as: 'sentTo_user',
                },
            },
            {
                $lookup: {
                    from: 'businessusers',
                    localField: 'sentTo',
                    foreignField: '_id',
                    as: 'sentTo_business',
                },
            },
            {
                $lookup: {
                    from: 'admins',
                    localField: 'sentBy',
                    foreignField: '_id',
                    as: 'sentBy_admin',
                },
            },
            {
                $lookup: {
                  from: 'admins',
                  localField: 'sentTo',
                  foreignField: '_id',
                  as: 'sentTo_admin'
                }
              },
          
              {
                $addFields: {
                  sentTo: {
                    $cond: {
                      if: { $gt: [{ $size: '$sentTo_user' }, 0] },
                      then: { $arrayElemAt: ['$sentTo_user', 0] },
                      else: { $arrayElemAt: ['$sentTo_business', 0]},
                      else: { $arrayElemAt: ['$sentTo_admin', 0]}
                    
                    }
                  },
                  sentBy: {
                    $cond: {
                      if: { $gt: [{ $size: '$sentBy_admin' }, 0] },
                      then: { $arrayElemAt: ['$sentBy_admin', 0] },
                      else: { $arrayElemAt: ['$sentBy_business', 0]},
                      else: { $arrayElemAt: ['$sentBy_user', 0]}
                    }
                  }
                }
              },
            // {
            //     $lookup: {
            //         from: 'businesses',
            //         localField: 'sentTo.businessId',
            //         foreignField: '_id',
            //         as: 'sentTo.business',
            //     },
            // },
            // {
            //     $lookup: {
            //         from: 'businesses',
            //         localField: 'sentBy.businessId',
            //         foreignField: '_id',
            //         as: 'sentBy.business',
            //     },
            // },
            // {
            //     $addFields: {
            //         'sentTo.businessId': { $arrayElemAt: ['$sentTo.business', 0] },
            //         'sentBy.businessId': { $arrayElemAt: ['$sentBy.business', 0] },
            //     },
            // },
            //  { "$match": { sentByModelType:"Admin"  } },
            {
                $match: {
                    $expr: [
                    {sentByModelType: "Admin" },
                    {  sentToModelType: "Admin"},
                  ],
                },
              },
            
            { $project: { sentTo_user: 0, sentTo_business: 0, sentBy_admin:0, sentTo_admin:0,sentBy_user: 0,sentBy_business: 0} },
            { $sort: { createdAt: 1 } },
        ])

        return ChatUsers;


    },


    getChatWithFullDetails: async (data,sortProperty, sortOrder = -1, offset = 0, limit = 50) => {
        console.log("getChatWithFullDetails Model Function called")
    
        const Chats = await Chat.aggregate([
            // { "$match": { "sentBy":data.sendid} }

            {
                $lookup: {
                    from: 'users',
                    localField: 'sentTo',
                    foreignField: '_id',
                    as: 'sentTo_user',
                },
            },
            {
                $lookup: {
                    from: 'businessusers',
                    localField: 'sentTo',
                    foreignField: '_id',
                    as: 'sentTo_business',
                },
            },
            {
                $lookup: {
                    from: 'admins',
                    localField: 'sentBy',
                    foreignField: '_id',
                    as: 'sentBy_admin',
                },
            },


            {
                $addFields: {
                    sentTo: {
                        $cond: {
                            if: { $gt: [{ $size: '$sentTo_user' }, 0] },
                            then: { $arrayElemAt: ['$sentTo_user', 0] },
                            else: { $arrayElemAt: ['$sentTo_business', 0] },
                        },
                    },
                    sentBy: {
                        $cond: {
                            if: { $gt: [{ $size: '$sentBy_admin' }, 0] },
                            then: { $arrayElemAt: ['$sentBy_admin', 0] },
                            else: { $arrayElemAt: ['$sentBy_admin', 0] },
                        },
                    },
                },
            },
            // {
            //     $lookup: {
            //         from: 'businesses',
            //         localField: 'sentTo.businessId',
            //         foreignField: '_id',
            //         as: 'sentTo.business',
            //     },
            // },
            // {
            //     $lookup: {
            //         from: 'businesses',
            //         localField: 'sentBy.businessId',
            //         foreignField: '_id',
            //         as: 'sentBy.business',
            //     },
            // },
            // {
            //     $addFields: {
            //         'sentTo.businessId': { $arrayElemAt: ['$sentTo.business', 0] },
            //         'sentBy.businessId': { $arrayElemAt: ['$sentBy.business', 0] },
            //     },
            // },
            
              { "$match": { sentByModelType:"Admin"} },
            
            { $project: { sentTo_user: 0, sentTo_business: 0, sentBy_admin:0,} },
            // { $sort: { createdAt: -1 } },


        ])
        .sort({ [sortProperty]: sortOrder })
            .skip(offset)
            .limit(limit)
            ;

        const Chatsize = await Chat.countDocuments()

        return {
            Chat: Chats,
            count:Chatsize,
            offset: offset,
            limit: limit
        };

    },
    getAdminChatWithFullDetails: async (data,sortProperty, sortOrder = -1, offset = 0, limit = 50) => {
        console.log("getChatWithFullDetails Model Function called")
    
        const Chats = await Chat.aggregate([
            // { "$match": { "sentBy":data.sendid} }

            {
                $lookup: {
                    from: 'users',
                    localField: 'sentTo',
                    foreignField: '_id',
                    as: 'sentTo_user',
                },
            },
            {
                $lookup: {
                    from: 'businessusers',
                    localField: 'sentTo',
                    foreignField: '_id',
                    as: 'sentTo_business',
                },
            },
            {
                $lookup: {
                  from: 'users',
                  localField: 'sentBy',
                  foreignField: '_id',
                  as: 'sentBy_user'
                }
              },
        
              {
                $lookup: {
                  from: 'businessusers',
                  localField: 'sentBy',
                  foreignField: '_id',
                  as: 'sentBy_business'
                }
              },
            {
                $lookup: {
                    from: 'admins',
                    localField: 'sentBy',
                    foreignField: '_id',
                    as: 'sentBy_admin',
                },
            },


            {
                $addFields: {
                    sentTo: {
                        $cond: {
                            if: { $gt: [{ $size: '$sentTo_user' }, 0] },
                            then: { $arrayElemAt: ['$sentTo_user', 0] },
                            else: { $arrayElemAt: ['$sentTo_business', 0] },
                        },
                    },
                    sentBy: {
                        $cond: {
                            if: { $gt: [{ $size: '$sentBy_admin' }, 0] },
                            then: { $arrayElemAt: ['$sentBy_admin', 0] },
                            else: { $arrayElemAt: ['$sentBy_admin', 0] },
                        },
                    },
                },
            },
            // {
            //     $lookup: {
            //         from: 'businesses',
            //         localField: 'sentTo.businessId',
            //         foreignField: '_id',
            //         as: 'sentTo.business',
            //     },
            // },
            // {
            //     $lookup: {
            //         from: 'businesses',
            //         localField: 'sentBy.businessId',
            //         foreignField: '_id',
            //         as: 'sentBy.business',
            //     },
            // },
            // {
            //     $addFields: {
            //         'sentTo.businessId': { $arrayElemAt: ['$sentTo.business', 0] },
            //         'sentBy.businessId': { $arrayElemAt: ['$sentBy.business', 0] },
            //     },
            // },
            //  { "$match": { sentByModelType:"Admin"} },
            
            { $project: { sentTo_user: 0, sentTo_business: 0, sentBy_admin:0,sentBy_user:0,sentBy_business:0} },
            // { $sort: { createdAt: -1 } },


        ])
        .sort({ [sortProperty]: sortOrder })
            .skip(offset)
            .limit(limit)
            ;

        const Chatsize = await Chat.countDocuments()

        return {
            Chat: Chats,
            count:Chatsize,
            offset: offset,
            limit: limit
        };

    },
    updatedOnChat: async (data) => {

        const result = await promise.all([Model.Message.findOneAndUpdate({ _id: data.chatId }, data, { new: true })])
        return result;

    }
};
