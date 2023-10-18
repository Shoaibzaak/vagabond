const Model = require("../../models/index");
const Validation = require("../../validations/validation");
const Message = require("../../Message");
const Services = require("../../services");
const Status = require("../../status");
const HTTPError = require("../../utils/CustomError");
const moment = require("moment");
const catchAsync = require("../../utils/catchAsync");
const referralCodes = require("referral-codes");
const encrypt = require("bcrypt");
const validatePassword = require("../../utils/validatePassword");

module.exports = {
  register: async (req, res, next) => {
    try {
      const {
        name,
        email,
        phoneNumber,
        password,
        companyCode,
        locationName,
        postCode,
        town,
        country,
        addressLine1,
        addressLine2 } = req.body;
      // Email validation
      if (!Validation.validateEmail(email)) {
        return res.badRequest("Invalid email format");
      }

      const isValidate = await validatePassword({ password });
      if (!isValidate) return res.badRequest(Message.passwordTooWeak);
      const hash = encrypt.hashSync(password, 10)
      const User = new Model.CompanyUser({
        name,
        email,
        phoneNumber,
        password: hash,
        companyCode
      });
      const verfifyEmail = await Model.CompanyUser.findOne({ email });
      if (verfifyEmail) throw new HTTPError(Status.BAD_REQUEST, Message.emailAlreadyExists);
      const user = await User.save();

      const locations = new Model.Properties({
        locationName,
        postCode,
        town,
        country,
        addressLine1,
        addressLine2

      })
      const location = await locations.save()
      const registeredUser = await Model.CompanyUser.findOneAndUpdate(
        { _id: user._id },
        {
          $set: {
            addresses: location._id,
          },
        },
        { new: true }
      )
      res.ok("Registration successfully", registeredUser);
    } catch (err) {
      next(err);
    }
  },
  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;
      if (!email || !password)
        throw new HTTPError(Status.BAD_REQUEST, Message.required);
      let user
      user = await Model.CompanyUser.findOne({ email })
      if (!user) throw new HTTPError(Status.NOT_FOUND, Message.userNotFound);
      encrypt.compare(password, user.password, (err, match) => {
        if (match) {
          const token = `GHA ${Services.JwtService.issue({
            id: Services.HashService.encrypt(user._id),
          })}`;
          return res.ok("Log in successfully", {
            token,
            user,
          });
        }
        else {
          return res.badRequest("Invalid Credentials");
        }

      })

    } catch (err) {
      console.log(err);
      next(err);
    }
  },

  verifyAccount: catchAsync(async (req, res, next) => {
    const { email } = req.body;
    if (!email)
      return res
        .status(400)
        .json({ success: false, message: Message.badRequest, data: null });
    // Email validation
    if (!Validation.validateEmail(email)) {
      return res.badRequest("Invalid email format");
    }

    // Check if the email is valid
    const isEmailValid = await Model.CompanyUser.findOne({
      // email: email.toLowerCase(),
      email: email
    });

    if (!isEmailValid)
      return res
        .status(400)
        .json({
          success: false, message: "Invalid email, The email entered is not registered", data: {
            stage: 0,
          }
        });


    const accountVerfied = await Model.CompanyUser.findOneAndUpdate(
      { _id: isEmailValid._id },
      { $set: { is_verified: true } }
    );

    return res.ok("Account verified successfully", accountVerfied);
  }),

  forgetPassword: catchAsync(async (req, res, next) => {
    const { email } = req.body;
    if (!email) return res.badRequest(Message.badRequest);

    let user;

    user = await Model.User.findOne({ email });

    // we have to send the email to the user for this activity

  }),


  changePassword: catchAsync(async (req, res, next) => {
    const { email, currentPassword, newPassword } = req.body;
    if (!email || !currentPassword || !newPassword)
      return res.status(400).json({
        success: false,
        message: Message.badRequest,
        data: null,
      });

    // Email validation
    if (!Validation.validateEmail(email)) {
      return res.badRequest("Invalid email format");
    }

    let user;
    user = await Model.CompanyUser.findOne({ email });
    if (user) {
    }
    if (
      !validatePassword({
        password: newPassword,
      })
    )
      return res.status(400).json({
        success: false,
        message: Message.passwordTooWeak,
        data: null,
      });
      encrypt.compare(currentPassword, user.password, (err, match) => {
        if (match) {
          encrypt.genSalt(10, (error, salt) => {
            if (error) return console.log(error);
            encrypt.hash(newPassword, salt, async (error, hash) => {
              if (user) {
                await Model.CompanyUser.findOneAndUpdate(
                  { _id: user._id },
                  { $set: { password: hash } }
                );
                const token = `GHA ${Services.JwtService.issue({
                  id: Services.HashService.encrypt(user._id),
                })}`;
                user = { ...user._doc, token, usertype: "User" };
                return res.ok("Password updated successfully", user);
              }
            });
          });
        }
        else {
          return res.badRequest("Invalid Credentials");
        }

      })
  }),

};
