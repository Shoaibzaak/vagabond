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
      await Services.EmailService.sendEmail(
        `
        <html>
        
        <head>
            <title></title>
            <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <meta http-equiv="X-UA-Compatible" content="IEedge" />
            <style type="text/css">
                @media screen {
                    @font-face {
                        font-family: 'Lato';
                        font-style: normal;
                        font-weight: 400;
                        src: local('Lato Regular'), local('Lato-Regular'), url(https://fonts.gstatic.com/s/lato/v11/qIIYRU-oROkIk8vfvxw6QvesZW2xOQ-xsNqO47m55DA.woff) format('woff');
                    }
        
                    @font-face {
                        font-family: 'Lato';
                        font-style: normal;
                        font-weight: 700;
                        src: local('Lato Bold'), local('Lato-Bold'), url(https://fonts.gstatic.com/s/lato/v11/qdgUG4U09HnJwhYI-uK18wLUuEpTyoUstqEm5AMlJo4.woff) format('woff');
                    }
        
                    @font-face {
                        font-family: 'Lato';
                        font-style: italic;
                        font-weight: 400;
                        src: local('Lato Italic'), local('Lato-Italic'), url(https://fonts.gstatic.com/s/lato/v11/RYyZNoeFgb0l7W3Vu1aSWOvvDin1pK8aKteLpeZ5c0A.woff) format('woff');
                    }
        
                    @font-face {
                        font-family: 'Lato';
                        font-style: italic;
                        font-weight: 700;
                        src: local('Lato Bold Italic'), local('Lato-BoldItalic'), url(https://fonts.gstatic.com/s/lato/v11/HkF_qI1x_noxlxhrhMQYELO3LdcAZYWl9Si6vvxL-qU.woff) format('woff');
                    }
                }
        
                /* CLIENT-SPECIFIC STYLES */
                body,
                table,
                td,
                a {
                    -webkit-text-size-adjust: 100%;
                    -ms-text-size-adjust: 100%;
                }
        
                table,
                td {
                    mso-table-lspace: 0pt;
                    mso-table-rspace: 0pt;
                }
        
                img {
                    -ms-interpolation-mode: bicubic;
                }
        
                /* RESET STYLES */
                img {
                    border: 0;
                    height: auto;
                    line-height: 100%;
                    outline: none;
                    text-decoration: none;
                }
        
                table {
                    border-collapse: collapse !important;
                }
        
                body {
                    height: 100% !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    width: 100% !important;
                }
        
                /* iOS BLUE LINKS */
                a[x-apple-data-detectors] {
                    color: inherit !important;
                    text-decoration: none !important;
                    font-size: inherit !important;
                    font-family: inherit !important;
                    font-weight: inherit !important;
                    line-height: inherit !important;
                }
        
                /* MOBILE STYLES */
                @media screen and (max-width: 600px) {
                    h1 {
                        font-size: 32px !important;
                        line-height: 32px !important;
                    }
                }
        
                /* ANDROID CENTER FIX */
                div[style*="margin: 16px 0;"] {
                    margin: 0 !important;
                }
        
                h5 {
                    font-size: 35px;
                }
        
                h2 {
                    font-size: 22px;
                }
        
                p {
                    font-size: 18px;
                }
        
                .logo {
                    width: 250px;
                }
        
                /* MOBILE STYLES */
                @media screen and (max-width: 600px) {
                    h5 {
                        font-size: 28px !important;
                    }
        
                    p {
                        font-size: 15px;
                    }
        
                    .logo {
                        width: 150px;
                    }
                }
        
                @media screen and (max-width: 450px) {
                    h5 {
                        font-size: 20px !important;
                    }
                }
            </style>
        </head>
        
        <body style="background-color: #fbfbfb; margin: 0; padding: 0;">
        
            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <!-- LOGO -->
                <tr>
                    <td bgcolor="#18b4f2" align="center" style="padding: 0px 14px 0px 14px; ">
                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 594px;">
                            <tr>
                                <td  align="center" valign="top"
                                    style="padding: 35px 20px 20px 20px; border-radius: 40px 40px 0px 0px; color: #111111; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 48px; font-weight: 400; letter-spacing: 4px; line-height: 48px;">
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr>
                  <td bgcolor="#18b4f2" align="center" style="padding: 0px 10px 0px 10px;">
                      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                          <tr>
                              <td bgcolor="#ffffff" align="center" style="border-radius: 40px 40px 0px 0px">
                                  <div
                                      style="border-radius: 40px 40px 0px 0px;max-width: 600px; padding: 23px 20px 20px 20px;">
                                  </div>
                              </td>
                          </tr>
                      </table>
                  </td>
              </tr>
                <tr>
                    <td bgcolor="#18b4f2" align="center" style="padding: 0px 10px 0px 10px;">
                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                            
                            <tr>
                           
                                <td bgcolor="#ffffff" align="center" valign="top"
                                    style="color: #1852f2; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 40px; font-weight: 400;letter-spacing: 2px; line-height: 48px;">
                                    <img class="logo" src="" style="display: block; border: 0px; padding-top: 50px; padding-bottom: 50px; margin: auto;" />
                                </td>
                            </tr>
                            <tr>
                                <td bgcolor="#ffffff" align="center" valign="top"
                                    style="color: #186ff2; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 40px; font-weight: 400;letter-spacing: 2px; line-height: 48px;">
                                    <h5 style="margin-bottom: 27px">Email Verification</h5>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td bgcolor="#18b4f2" align="center" style="padding: 0px 10px 0px 10px;">
                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                            <tr>
                                <td bgcolor="#ffffff" align="center"
                                    style="font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 20px;">
                                    <p>Please, use this OTP to verify your email</p>
                                     <h3>{{otp}}</h3>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td bgcolor="#18b4f2" align="center" style="padding: 0px 10px 0px 10px;">
                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                            <tr>
                                <td bgcolor="#ffffff" align="center" style="border-radius: 0px 0px 40px 40px">
                                    <div
                                        style="border-radius: 0px 0px 40px 40px;max-width: 600px; padding: 23px 20px 20px 20px; border-bottom: 3px solid #18b4f2;">
                                    </div>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td bgcolor="#18b4f2" align="center" style="padding: 30px 10px 0px 10px;">
                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 900px;">
                            <tr>
                                <td align="center"
                                    style="padding: 20px 30px 0px 30px; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 400; line-height: 25px;">
                                    <h2 style="font-size: 17px; font-weight: 400; margin: 0; color: #fbfbfb;">&copy; vagabond 2023.</h2>
                                </td>
                            </tr> 
                        </table>
                    </td>
                </tr>
                <tr>
                    <td bgcolor="#18b4f2" align="center" style="padding: 0px 10px 0px 10px;">
                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 900px;">
                            <tr>
        
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td bgcolor="#18b4f2" align="center" style="padding: 0px 10px 0px 10px;">
                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 900px;">
                            <tr>
                                <td bgcolor="#18b4f2" align="left" style="padding: 0px 10px 10px 10px; "><br>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        
        </html>`,
        otpCode,
        email,
        "User Account Email Verification | vagabond"
      );
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
    // const token =  Services.JwtService.issue({
    //   id: Services.HashService.encrypt(user._id),
    // })
    // console.log(token)
    await Services.EmailService.sendEmail(
      "public/otpVerification.html",
      otpCode,
      email,
      "Reset Password | In VAGABOND"
    );
    return res.ok("Reset password otp has been sent to your registered email.");
  }),

  forgetPassword: catchAsync(async (req, res, next) => {
    const { email } = req.body;
    if (!email) return res.badRequest(Message.badRequest);
    let user;
    user = await Model.User.findOne({ email });

    if (!user) throw new HTTPError(Status.BAD_REQUEST, Message.userNotFound);
    // if (user.isEmailConfirmed == false) throw new HTTPError(Status.BAD_REQUEST, "Your account is not verfied");
    const otp = otpService.issue();
    const otpExpiryCode = moment().add(10, "minutes").valueOf();
    const tempPassword = referralCodes.generate({
      length: 8,
      charset: referralCodes.charset("alphanumeric"),
    })[0];
    // console.log(tempPassword,"tempPassword===>")
    encrypt.genSalt(10, (error, salt) => {
      if (error) return console.log(error);
      encrypt.hash(tempPassword, salt, async (error, hash) => {
        // if (user) {
        await Model.User.findOneAndUpdate(
          { _id: user._id },
          { $set: { password: hash } }
        );
        //   // const token = `GHA ${Services.JwtService.issue({
        //   //   id: Services.HashService.encrypt(user._id),
        //   // })}`;
        //   // user = { ...user._doc, usertype: "User" };
        //   // return res.ok("Password updated successfully and", user);
        // }
      });
    });

    // if (user) {
    //   await Model.User.findOneAndUpdate({ _id: user._id }, { $set: { otp: otp, otpExpiry: otpExpiryCode } });
    // }
    let replacements = {
      // otp,
      tempPassword,
    };
    // const token =  Services.JwtService.issue({
    //   id: Services.HashService.encrypt(user._id),
    // })
    // console.log(token)
    await Services.EmailService.sendEmail(
      "public/otpResetPass.html",
      replacements,
      email,
      "Forget Password | In VAGABOND"
    );
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
    console.log("temporaryDeclineAccount")
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
  // Retrieve  user by userId
  // Retrieve user by userId with associated public and private pins and wishlist items
getUser: catchAsync(async (req, res, next) => {
  console.log("findUserById is called");
  try {
      var userId = req.params.id;
      console.log(userId);

      // Retrieve the user by ID
      var result = await Model.User.findById({ _id: userId });

      // Retrieve associated public and private pins
      var publicPins = await Model.Pin.find({ userId: userId, pinType: "PUBLIC" });
      var privatePins = await Model.Pin.find({ userId: userId, pinType: "PRIVATE" });

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
      return responseHelper.success(res, { user: result,  countModels }, message);
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
