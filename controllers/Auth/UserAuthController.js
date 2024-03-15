const Model = require("../../models/index");
const Validation = require("../../validations/validation");
const Message = require("../../Message");
const Services = require("../../services");
const otpService = require("../../services/OtpService");
const Status = require("../../status");
const HTTPError = require("../../utils/CustomError");
const moment = require("moment");
const catchAsync = require("../../utils/catchAsync");
const referralCodes = require("referral-codes");
const encrypt = require("bcrypt");
const responseHelper = require("../../helper/response.helper");
const validatePassword = require("../../utils/validatePassword");
const userHelper = require("../../helper/user.helper");
const cloudUpload = require("../../cloudinary");
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
      const hash = encrypt.hashSync(password, 10);
      const otp = otpService.issue();
      const otpExpiry = moment().add(10, "minutes").valueOf();
      const User = new Model.User({
        fullName,
        email,
        password: hash,
        otp: otp,
        otpExpiry: otpExpiry,
      });
      const verfifyEmail = await Model.User.findOne({ email });
      if (verfifyEmail)
        throw new HTTPError(Status.BAD_REQUEST, Message.emailAlreadyExists);
      await User.save();
      let otpCode = {
        otp,
      };
      // Construct the email message with the OTP
      const emailMessage = `Thank you for registering with Vagabond.\n\nYour verification code is: ${otp}`;

      // Send the email with the message directly
      await Services.EmailService.sendEmail(
        emailMessage,
        otp,
        email,
        "User Account Email Verification | vagabond"
      );
      // await Services.EmailService.sendEmail(
      //   "public/otpVerification.html",
      //   otpCode,
      //   email,
      //   "User Account Email Verification | vagabond"
      // );
      return res.ok(
        "Registration successful. A verification code has been sent to your email.",
        User
      );
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
      let user;
      user = await Model.User.findOne({ email });
      if (!user) throw new HTTPError(Status.NOT_FOUND, Message.userNotFound);
      if (user.isEmailConfirmed == true) {
        encrypt.compare(password, user.password, async (err, match) => {
          if (match) {
            await Model.User.findOneAndUpdate(
              { _id: user._id },
              { $unset: { otp: 1, otpExpiry: 1 } }
            );
            const token = `GHA ${Services.JwtService.issue({
              id: Services.HashService.encrypt(user._id),
            })}`;
            return res.ok("Log in successfully", {
              token,
              user,
            });
          } else {
            return res.badRequest("Invalid Credentials");
          }
        });
      } else {
        return res.badRequest("User Not Verified");
      }
    } catch (err) {
      console.log(err);
      next(err);
    }
  },
  accountVerification: catchAsync(async (req, res, next) => {
    const { otp } = req.body;
    if (!otp) throw new HTTPError(Status.BAD_REQUEST, Message.required);

    const now = moment().valueOf();
    let user;
    if (otp) {
      user = await Model.User.findOne({ otp: otp });
    } else {
      throw new HTTPError(Status.BAD_REQUEST, "otp is required");
    }

    if (!user) throw new HTTPError(Status.BAD_REQUEST, Message.userNotFound);
    else if (user.otpExpiry < now)
      throw new HTTPError(Status.BAD_REQUEST, "OTP expired");
    else if (user.isEmailConfirmed)
      throw new HTTPError(Status.BAD_REQUEST, "Account already verified");
    else if (parseInt(user.otp) !== parseInt(otp))
      throw new HTTPError(Status.BAD_REQUEST, "Invalid OTP");

    let userData = {};
    if (otp) {
      await Model.User.findOneAndUpdate(
        { otp: otp },
        { $set: { isEmailConfirmed: true }, $unset: { otp: 1, otpExpiry: 1 } }
      );
    }

    userData = {
      _id: user._id,
      fullname: user.fullName,
      email: user.email,
      ...userData,
    };
    return res.ok("Account verified successfully", userData);
  }),

  //resend otp to email
  resendOtp: catchAsync(async (req, res, next) => {
    const { email } = req.body;
    if (!email) throw new HTTPError(Status.BAD_REQUEST, Message.required);
    if (!Validation.validateEmail(email)) {
      return res.badRequest("Invalid email format");
    }
    const otp = otpService.issue();
    const otpExpiryCode = moment().add(10, "minutes").valueOf();
    if (email) {
      await Model.User.findOneAndUpdate(
        { email: email },
        { $set: { otp: otp, otpExpiry: otpExpiryCode } }
      );
    }
    let otpCode = {
      otp,
    };
    // Construct the email message with the OTP
    const emailMessage = `Thank you for registering with Vagabond.\n\nYour verification code is: ${otp}`;

    // Send the email with the message directly
    await Services.EmailService.sendEmail(
      emailMessage,
      otp,
      email,
      "User Account Email Verification | vagabond"
    );
    
      /* start   this code is used for send html templates through path define not working due to vercel*/
    
    // await Services.EmailService.sendEmail(
    //   "public/otpVerification.html",
    //   otpCode,
    //   email,
    //   "Reset Password | In VAGABOND"
    // );
    
      /* end */
    

    return res.ok("Reset password otp has been sent to your registered email.");
  }),

  forgetPassword: catchAsync(async (req, res, next) => {
    const { email } = req.body;
    if (!email) return res.badRequest(Message.badRequest);
    let user;
    user = await Model.User.findOne({ email });

    if (!user) throw new HTTPError(Status.BAD_REQUEST, Message.userNotFound);
    const otp = otpService.issue();
    const otpExpiryCode = moment().add(10, "minutes").valueOf();
      const tempPassword = Services.EncryptPassword.generateRandomPassword(8); 
      const hashedPassword = await Services.EncryptPassword.encryptPassword(tempPassword);
      await Model.User.findOneAndUpdate(
          { _id: user._id },
          { $set: { password: hashedPassword } }
      );
    let replacements = {
      // otp,
      tempPassword,
    };
    // const emailMessage = `Thank you for registering with Vagabond.\n\nYour temporary password is: ${tempPassword}`;

    // // Send the email with the message directly
    // await Services.EmailService.sendEmail(
    //   emailMessage,
    //   tempPassword,
    //   email,
    //   "ForgetPassword | vagabond"
    // );
    // await Services.EmailService.sendEmail(
    //   "public/otpResetPass.html",
    //   replacements,
    //   email,
    //   "Forget Password | In VAGABOND"
    // );
    return res.ok(
      "Temporary password  has been sent to your registered email."
    );
  }),
  updatePassword: catchAsync(async (req, res, next) => {
    const { otp, newPassword } = req.body;
    if (!otp || !newPassword)
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
            { $set: { password: hash }, $unset: { otp: 1, otpExpiry: 1 } }
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
    // this user get from authenticated user
    const verifiedUser = req.user;
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({
        success: false,
        message: Message.badRequest,
        data: null,
      });
    let user;
    user = await Model.User.findOne({ _id: verifiedUser._id });
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
                { $set: { password: hash } }
              );
              // const token = `GHA ${Services.JwtService.issue({
              //   id: Services.HashService.encrypt(user._id),
              // })}`;
              user = { ...user._doc, usertype: "User" };
              return res.ok("Password updated successfully", user);
            }
          });
        });
      } else {
        return res.badRequest("Invalid Credentials");
      }
    });
  }),
  // Create a new Contact User
  createContact: catchAsync(async (req, res, next) => {
    console.log("createContact is called");
    try {
      var contactData = req.body;
      const existingContact = await Model.Contact.findOne({
        email: contactData.email,
      });

      if (existingContact) {
        return responseHelper.badRequest(
          res,
          "Contact with this email already exists."
        );
      }

      const contact = new Model.Contact(contactData);

      await contact.save();
      var message = "contact created successfully";
      if (contact == null) {
        message = "contact does not exist.";
      }

      return responseHelper.success(res, contact, message);
    } catch (error) {
      responseHelper.requestfailure(res, error);
    }
  }),
  // decline user
  temporaryDeclineAccount: catchAsync(async (req, res, next) => {
    console.log("temporaryDeclineAccount");
    try {
      const { password } = req.body;
      const user = await Model.User.findById(req.user.id);

      if (!user) {
        throw new HTTPError(Status.UNAUTHORIZED, "User not found");
      }

      // Compare the provided password with the hashed password stored in the user record
      const passwordMatch = await encrypt.compare(password, user.password);

      if (!passwordMatch) {
        throw new HTTPError(Status.UNAUTHORIZED, "Invalid password");
      }
      var result = await Model.User.findOneAndUpdate(
        { _id: user },
        { isDeleted: true },
        {
          new: true,
        }
      );
      var message = "Account  disabled successfully";
      res.ok(message, result);
    } catch (err) {
      throw new HTTPError(Status.INTERNAL_SERVER_ERROR, err);
    }
  }),

  // decline user
  declineAccount: catchAsync(async (req, res, next) => {
    var userId = req.params.id;
    try {
      const userUser = await Model.User.findByIdAndDelete(userId);
      if (!userUser) return res.badRequest("user  Not Found in our records");
      var message = "user deleted successfully";
      res.ok(message, userUser);
    } catch (err) {
      throw new HTTPError(Status.INTERNAL_SERVER_ERROR, err);
    }
  }),

  uploadProfilePic: catchAsync(async (req, res, next) => {
    const userData = req.body;
    console.log("uploadProfilePic has been called");
    try {
      // Check if profile picture file is present
      if (
        !req.files ||
        !req.files.profilePic ||
        req.files.profilePic.length === 0
      ) {
        console.log("No profile pic is selected");
        return res.badRequest("No profile pic is selected");
      }

      const file = req.files.profilePic[0]; // Assuming you only want to handle one profile picture
      const { path } = file;

      // Upload the file to Cloudinary
      const cloudinaryResult = await cloudUpload.cloudinaryUpload(path);
      // Update user model with the image URL
      const result = await Model.User.findByIdAndUpdate(
        { _id: userData.userId },
        {
          profilePic: cloudinaryResult,
          bio: userData.bio,
          address: userData.address,
        }, // Assuming 'profilePic' is a field in your user model
        { new: true }
      );

      if (!result) {
        console.log("User not found");
        throw new HTTPError(Status.NOT_FOUND, "User not found");
      }

      const message = "Profile picture uploaded successfully";
      console.log(message);
      res.ok(message, result);
    } catch (err) {
      // Log the error for debugging purposes
      console.error(err);

      // Handle specific HTTP errors
      if (err instanceof HTTPError) {
        res.status(err.statusCode).json({ error: err.message });
      } else {
        // For unhandled errors, return a generic 500 Internal Server Error
        res
          .status(Status.INTERNAL_SERVER_ERROR)
          .json({ error: "Internal Server Error" });
      }
    }
  }),
  getUser: catchAsync(async (req, res, next) => {
    console.log("findUserById is called");
    try {
      var userId = req.params.id;
      console.log(userId);

      // Retrieve the user by ID
      var result = await Model.User.findById({ _id: userId });

      // Retrieve associated public and private pins
      var publicPins = await Model.Pin.find({
        userId: userId,
        pinType: "PUBLIC",
      });
      var privatePins = await Model.Pin.find({
        userId: userId,
        pinType: "PRIVATE",
      });

      // Retrieve associated wishlist items
      var wishlistItems = await Model.Whishlist.find({ userId: userId });

      // Create a countModels object
      const countModels = {
        countPublicPins: publicPins.length,
        countPrivatePins: privatePins.length,
        countWishlistItems: wishlistItems.length,
      };

      var message = "userId found successfully";
      if (result == null) {
        message = "userId does not exist.";
      }

      // Return the response with the user details, count models, and message
      return responseHelper.success(
        res,
        { user: result, countModels },
        message
      );
    } catch (error) {
      // Handle errors and send a failure response
      responseHelper.requestfailure(res, error);
    }
  }),

  // Update a User user
  updateUser: catchAsync(async (req, res, next) => {
    // Get the User user data from the request body
    var userData = req.body;
    try {
      var result = await Model.User.findOneAndUpdate(
        { _id: userData.UserId },
        userData,
        {
          new: true,
        }
      );
      // Check if the User user was found and updated successfully
      if (!result) {
        return res.status(Status.NOT_FOUND).json({
          error: "User not found",
        });
      }
      var message = "User  status updated successfully";
      res.ok(message, result);
    } catch (err) {
      throw new HTTPError(Status.INTERNAL_SERVER_ERROR, err);
    }
  }),
};
