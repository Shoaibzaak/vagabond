const Model = require("../../models/index");
const Validation = require("../../validations/validation");
const Message = require("../../Message");
const Services = require("../../services");
const otpService = require("../../services/OtpService")
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
      const { fullName, email, password } = req.body;
      // Email validation
      if (!Validation.validateEmail(email)) {
        return res.badRequest("Invalid email format");
      }

      const isValidate = await validatePassword({ password });
      if (!isValidate) return res.badRequest(Message.passwordTooWeak);
      const hash = encrypt.hashSync(password, 10)
      const otp = otpService.issue();
      const otpExpiry = moment().add(10, "minutes").valueOf();
      const User = new Model.User({
        fullName,
        email,
        password: hash,
        otp: otp,
        otpExpiry: otpExpiry
      });
      const verfifyEmail = await Model.User.findOne({ email });
      if (verfifyEmail) throw new HTTPError(Status.BAD_REQUEST, Message.emailAlreadyExists);
      await User.save();
      let otpCode = {
        otp
      }
      await Services.EmailService.sendEmail("public/otpVerification.html", otpCode, email, "User Account Email Verification | vagabond")
      return res.ok("Registration successful. A verification code has been sent to your email.", User);
    } catch (err) {
      next(err);
    }
  },

  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;
      if (!email || !password)
        throw new HTTPError(Status.BAD_REQUEST, Message.required);
        // Email validation
        if (!Validation.validateEmail(email)) {
          return res.badRequest("Invalid email format");
        }
      let user
      user = await Model.User.findOne({ email })
      if (!user) throw new HTTPError(Status.NOT_FOUND, Message.userNotFound);
      if (user.isEmailConfirmed == true) {
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


      }
      else {
        return res.badRequest("User Not Verified")

      }
    } catch (err) {
      console.log(err);
      next(err);
    }
  },
  accountVerification: catchAsync(async (req, res, next) => {
    const { userId, otp } = req.body;
    if (!otp || !userId)
      throw new HTTPError(Status.BAD_REQUEST, Message.required);

    const now = moment().valueOf();
    let user;
    if (userId) {
      user = await Model.User.findOne({ _id: userId })
    }

    else {
      throw new HTTPError(Status.BAD_REQUEST, "Id is required");
    }

    if (!user) throw new HTTPError(Status.BAD_REQUEST, Message.userNotFound);
    else if (user.otpExpiry < now) throw new HTTPError(Status.BAD_REQUEST, "OTP expired");
    else if (user.isEmailConfirmed) throw new HTTPError(Status.BAD_REQUEST, "Account already verified");
    else if (parseInt(user.otp) !== parseInt(otp)) throw new HTTPError(Status.BAD_REQUEST, "Invalid OTP");


    let userData = {};
    if (userId) {
      await Model.User.findOneAndUpdate({ _id: userId }, { $set: { isEmailConfirmed: true }, $unset: { otp: 1, otpExpiry: 1 } });
    }

    userData = {
      _id: user._id,
      fullname: user.fullName,
      email: user.email,
      ...userData
    }
    return res.ok("Account verified successfully", userData);
  }),

  //resend otp to email
  resendOtp: catchAsync(async (req, res, next) => {
    const { email } = req.body;
    if (!email)
      throw new HTTPError(Status.BAD_REQUEST, Message.required);
    if (!Validation.validateEmail(email)) {
      return res.badRequest("Invalid email format");
    }
    const otp = otpService.issue();
    const otpExpiryCode = moment().add(10, "minutes").valueOf();
    if (email) {
      await Model.User.findOneAndUpdate({ email: email }, { $set: { otp: otp, otpExpiry: otpExpiryCode } });
    }
    let otpCode = {
      otp
    }
    // const token =  Services.JwtService.issue({
    //   id: Services.HashService.encrypt(user._id),
    // })
    // console.log(token)
    await Services.EmailService.sendEmail("public/otpVerification.html", otpCode, email, "Reset Password | In VAGABOND");
    return res.ok("Reset password otp has been sent to your registered email.");


  }),

  forgetPassword: catchAsync(async (req, res, next) => {
    const { email } = req.body;
    if (!email) return res.badRequest(Message.badRequest);
    let user;
    user = await Model.User.findOne({ email });

    if (!user) throw new HTTPError(Status.BAD_REQUEST, Message.userNotFound);
    if (user.isEmailConfirmed == false) throw new HTTPError(Status.BAD_REQUEST, "Your account is not verfied");
    const otp = otpService.issue();
    const otpExpiryCode = moment().add(10, "minutes").valueOf();
    if (user) {
      await Model.User.findOneAndUpdate({ _id: user._id }, { $set: { otp: otp, otpExpiry: otpExpiryCode } });
    }
    let otpCode = {
      otp
    }
    // const token =  Services.JwtService.issue({
    //   id: Services.HashService.encrypt(user._id),
    // })
    // console.log(token)
    await Services.EmailService.sendEmail("public/otpResetPass.html", otpCode, email, "Reset Password | In VAGABOND");
    return res.ok("Reset password otp has been sent to your registered email.");

  }),
  updatePassword: catchAsync(async (req, res, next) => {
    const { otp,newPassword } = req.body;
    if (!otp ||!newPassword)
      return res.status(400).json({
        success: false,
        message: Message.badRequest,
        data: null,
      });
    let user;
    user = await Model.User.findOne({ otp });
    //User not found
    if (!user) throw new HTTPError(Status.NOT_FOUND, Message.userNotFound);
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
      encrypt.genSalt(10, (error, salt) => {
        if (error) return console.log(error);
        encrypt.hash(newPassword, salt, async (error, hash) => {
          if (user) {
            await Model.User.findOneAndUpdate(
              { _id: user._id },
              { $set: { password: hash }, $unset: { otp: 1, otpExpiry: 1 } },

            );
            // const token = `GHA ${Services.JwtService.issue({
            //   id: Services.HashService.encrypt(user._id),
            // })}`;
            user = { ...user._doc, usertype: "User" };
            return res.ok("Password updated successfully", user);
          }
        });
      });
    
  }),

  changePassword: catchAsync(async (req, res, next) => {
    const { email, currentPassword, newPassword } = req.body;
    if (!email|| !currentPassword || !newPassword)
      return res.status(400).json({
        success: false,
        message: Message.badRequest,
        data: null,
      });
    let user;
    user = await Model.User.findOne({ email });
    //User not found
    if (!user) throw new HTTPError(Status.NOT_FOUND, Message.userNotFound);
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
              await Model.User.findOneAndUpdate(
                { _id: user._id },
                { $set: { password: hash }, $unset: { otp: 1, otpExpiry: 1 } },

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
