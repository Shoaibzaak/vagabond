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
      const { name, email, phoneNumber, password } = req.body;
      // Email validation
      if (!Validation.validateEmail(email)) {
        return res.badRequest("Invalid email format");
      }

      const isValidate = await validatePassword({ password });
      if (!isValidate) return res.badRequest(Message.passwordTooWeak);
      const hash = encrypt.hashSync(password, 10)

      const User = new Model.User({
        name,
        email,
        phoneNumber,
        password: hash
      });
      const verfifyEmail = await Model.User.findOne({ email });
      if (verfifyEmail) throw new HTTPError(Status.BAD_REQUEST, Message.emailAlreadyExists);
      await User.save();
      res.ok("Registration successfully", User);
    } catch (err) {
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
    const isEmailValid = await Model.User.findOne({
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


    const accountVerfied = await Model.User.findOneAndUpdate(
      { _id: isEmailValid._id },
      { $set: { is_verified: true } }
    );

    return res.ok("Account verified successfully", accountVerfied);
  }),


  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;
      if (!email || !password)
        throw new HTTPError(Status.BAD_REQUEST, Message.required);
      let user
      user = await Model.User.findOne({ email })
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


  socialSignIn: catchAsync(async (req, res, next) => {
    const { googleId, facebookId, fullname, email, deviceId } = req.body;
    if (!email) return res.badRequest(Message.badRequest);
    if (!googleId && !facebookId) return res.badRequest(Message.badRequest);

    let user = await Model.User.findOne({ email: email.toLowerCase() });
    let business = await Model.BusinessUser.findOne({
      email: email.toLowerCase(),
    });

    let updateObj = {};
    if (googleId) updateObj.googleId = googleId;
    if (facebookId) updateObj.facebookId = facebookId;
    if (deviceId) updateObj.deviceId = deviceId;

    if (user) {
      user = await Model.User.findOneAndUpdate(
        { _id: user._id },
        { $set: updateObj }
      );
    } else if (business) {
      business = await Model.BusinessUser.findOneAndUpdate(
        { _id: business._id },
        { $set: updateObj }
      );
    } else {
      //const otp = Services.OtpService.issue();
      let userOtpExist = await Model.UserOTP.findOne({ email: email.toLowerCase() });
      const otp = "123456";

      if (!userOtpExist) {
        const expiredIn = moment().add(15, "minutes").valueOf();
        const userOtp = new Model.UserOTP({
          googleId,
          facebookId,
          fullname,
          email,
          otp,
          expiredIn,
          isVerified: true,
          stage: 2
        });
        await userOtp.save();
      }

    }

    if (user) {
      const token = `GHA ${Services.JwtService.issue({
        id: Services.HashService.encrypt(user._id),
      })}`;
      return res.ok("Log in successful", {
        token,
        user,
      });
    } else if (business) {
      const token = `GHA ${Services.JwtService.issue({
        id: Services.HashService.encrypt(business._id),
      })}`;
      return res.ok("Log in successful", {
        token,
        business,
      });
    } else {
      let q_user = await Model.UserOTP.findOne({
        email: email.toLowerCase(),
      });
      const token = `GHA ${Services.JwtService.issue({
        id: Services.HashService.encrypt(q_user._id),
      })}`;
      q_user = { ...q_user._doc, token, password: null };

      return res
        .status(400)
        .json({ success: false, message: "Profile setup is pending", data: { user: q_user } });
    }
  }),

  forgetPassword: catchAsync(async (req, res, next) => {
    const { email } = req.body;
    if (!email) return res.badRequest(Message.badRequest);

    let user;
    

    user = await Model.User.findOne({ email });
    
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
    user = await Model.User.findOne({ email });
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


  setupProfile: catchAsync(async (req, res, next) => {
    let {
      usertype,
      email,
      bio,
      title,
      sectors,
      lat,
      long,
      radius,
      location,
      address,
      vatNumber,
      registrationNumber,
      employeeCount,
      users,
      deviceId,
      isPrivacyPolicy
    } = req.body;
    const allowedImageFormats = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!usertype && !email)
      return res.status(400).json({
        success: false,
        message: Message.badRequest,
        data: null,
      });

    const userOtp = await Model.UserOTP.findOne({ email: email.toLowerCase() });
    if (!userOtp) return res.badRequest("Invalid Email, The email entered is not registered");

    if (lat && long) {
      location = {
        type: "Point",
        coordinates: [parseFloat(lat), parseFloat(long)],
      };
    }
    if (usertype === "USER") {
      let profilePic;
      let resume;
      if (req.files) {
        if (req.files.profilePic && req.files.profilePic.length > 0) {
          const uploadedFile = req.files.profilePic[0];
          if (allowedImageFormats.includes(uploadedFile.mimetype)) {
            profilePic = `uploads/${uploadedFile.filename}`;
          } else {
            return res.badRequest("Invalid image format. Only JPG, JPEG and PNG images are allowed.");
          }
        } else {
          profilePic = null;
        }
        if (req.files.resume && req.files.resume.length > 0) {
          resume = `uploads/${req.files.resume[0].filename}`;
        } else {
          resume = null;
        }

      }

      let user = new Model.User({
        email,
        fullname: userOtp.fullname,
        password: userOtp.password,
        profilePic,
        googleId: userOtp.googleId,
        facebookId: userOtp.facebookId,
        bio,
        title,
        sectors,
        location,
        radius,
        resume,
        deviceId: deviceId ? deviceId : userOtp.deviceId,
        profileSetup: true,
        stage: 3,
        isPrivacyPolicy
      });
      user = await user.save();
      await Model.UserOTP.findOneAndUpdate(
        { email: userOtp.email },
        { $set: { profileSetup: true, stage: 3 } },
        { new: true }
      );
      const token = `GHA ${Services.JwtService.issue({
        id: Services.HashService.encrypt(user._id),
      })}`;

      user = {
        ...user._doc,
        token,
        password: null,
        usertype: "user",
      };
      return res.ok("Profile setup successfully", user);
    } else if (usertype === "BUSINESS") {
      let profilePic;
      if (req.files) {
        if (req.files.profilePic && req.files.profilePic.length > 0) {
          const uploadedFile = req.files.profilePic[0];
          if (allowedImageFormats.includes(uploadedFile.mimetype)) {
            profilePic = `uploads/${uploadedFile.filename}`;
          } else {
            return res.badRequest("Invalid image format. Only JPEG and PNG images are allowed.");
          }
        }
      }

      let user = new Model.Business({
        profilePic,
        bio,
        title,
        sectors,
        address,
        location,
        vatNumber,
        registrationNumber,
        employeeCount,
        profileSetup: true,
        stage: 3,
        isPrivacyPolicy
      });
      await user.save();
      await Model.UserOTP.findOneAndUpdate(
        { _id: userOtp._id },
        { $set: { profileSetup: true, stage: 3 } },
        { new: true }
      );
      let businessUser = new Model.BusinessUser({
        email,
        fullname: userOtp.fullname,
        password: userOtp.password,
        googleId: userOtp.googleId,
        facebookId: userOtp.facebookId,
        deviceId: deviceId ? deviceId : userOtp.deviceId,
        businessId: user._id,
        isAdmin: true,
      });
      await businessUser.save();

      if (users && users.length > 0) {
        users.forEach(async (u) => {
          const bUser = new Model.BusinessUser({
            fullname: u.name,
            email: u.email,
            password: u.password,
            businessId: user._id,
          });
          await bUser.save();
        });
      }

      const token = `GHA ${Services.JwtService.issue({
        id: Services.HashService.encrypt(businessUser._id),
      })}`;
      businessUser = await Model.BusinessUser.findById(
        businessUser._id
      ).populate("businessId");

      businessUser = {
        ...businessUser._doc,
        token,
        password: null,
        usertype: "business",
      };
      return res.ok("Profile setup successfully", businessUser);
    } else {
      return res.status(400).json({
        success: false,
        message: Message.badRequest,
        data: null,
      });
    }
  }),
};
