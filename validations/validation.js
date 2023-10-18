const Model = require("../models/index");
const HTTPError = require("../utils/CustomError");
const Status = require("../status");
const Message = require("../Message");

module.exports = {

  validateEmail : (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  validateSubscription: async (id, usertype) => {
    const subscription = await Model.Subscription.findOne({
      _id: id,
      usertype,
      isActive: true,
    });
    if (!subscription)
      throw new HTTPError(Status.BAD_REQUEST, Message.subscriptionNotFound);
    return subscription;
  },

  validateJob: async (id, businessId) => {
    let searchObj = { _id: id, isActive: true };
    if (businessId) searchObj.businessId = businessId;
    const job = await Model.Job.findOne(searchObj)
      .populate(
        "instructions"
      )
      .populate(
        "businessId"
      )
    if (!job) throw new HTTPError(Status.BAD_REQUEST, Message.jobNotFound);
    return job;
  },

  validateJobInstructions: async (id, businessId) => {
    const jobInstruction = await Model.JobInstruction.findOne({
      _id: id,
      isActive: true,
      businessId,
    }).populate("businessId");
    if (!jobInstruction)
      throw new HTTPError(Status.BAD_REQUEST, Message.jobInstructionsNotFound);
    return jobInstruction;
  },

  validateUser: async (id) => {
    const user = await Model.User.findOne({ _id: id, isActive: true }).populate(
      "sectors.sector"
    );
    if (!user) throw new HTTPError(Status.BAD_REQUEST, Message.userNotFound);
    return user;
  },

  validateApplication: async (id) => {
    const application = await Model.Application.findOne({
      _id: id,
      isCancelled: false,
    })
    if (!application)
      throw new HTTPError(Status.BAD_REQUEST, Message.applicationNotFound);
    return application;
  },

  validateShift: async (id) => {
    const shift = await Model.Shift.findOne({
      _id: id,
      status: "NOT_STARTED",
    }).populate("jobId");
    if (!shift) throw new HTTPError(Status.BAD_REQUEST, Message.shiftNotFound);
    return shift;
  },

  validateBusiness: async (id) => {
    const business = await Model.Business.findOne({
      _id: id,
      isActive: true,
    }).populate("sectors");
    if (!business)
      throw new HTTPError(Status.BAD_REQUEST, Message.businessNotFound);
    return business;
  },

  validateTemplate: async (id, userId) => {
    const template = await Model.JobTemplate.find({
      _id: id,
      userId,
    });
    if (!template)
      throw new HTTPError(Status.BAD_REQUEST, Message.templateNotFound);
    return template;
  },

  validateAvailability: async (id, userId) => {
    const availability = await Model.Availability.findOne({ _id: id, userId });
    if (!availability)
      throw new HTTPError(Status.BAD_REQUEST, Message.availabilityNotFound);
    return availability;
  },

  validateAccountNumber: async (accountNumber) => {
    const accountNumberPattern = /^\d{8}$/;
    return accountNumberPattern.test(accountNumber);
  },


  validatePaymentDetail: async (id, userId) => {
    const paymentDetail = await Model.PaymentDetail.findOne({ _id: id, userId });
    if (!paymentDetail)
      throw new HTTPError(Status.BAD_REQUEST, Message.DetailNotFound);
    return paymentDetail;
  },

};
