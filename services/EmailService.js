var nodeMailer = require("nodemailer");

var transporter = nodeMailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.NODEMAILER_USERNAME,
    pass: process.env.NODEMAILER_PASSWORD,
  },
});
console.log(transporter,'transport')
module.exports = {
  sendMail: (payload) => {
    const { sender, recipients, subject, html, text } = payload;
    return new Promise((resolve, reject) => {
      var mailOptions = {
        from: sender,
        to: recipients,
        subject,
        html: html ? html : undefined,
        text: text ? text : undefined,
      };
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return reject(error);
        }
        return resolve(info);
      });
    });
  },
};
