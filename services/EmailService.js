var nodeMailer = require("nodemailer");
const fs = require("fs");
const handlebars = require("handlebars");
const path = require("path");
var transporter = nodeMailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: `${process.env.MAILER_USER}`,
    pass: `${process.env.MAILER_PASSWORD}`,
  },
});
let from = "no-reply <vagabond.co.usa>"

var readHTMLFile = function (path, callback) {
	fs.readFile(path, { encoding: "utf-8" }, function (err, html) {
	  if (err) {
	    callback(err);
	  } else {
	    callback(null, html);
	  }
	});
};

module.exports = {
	sendEmail: (templateName, replacements, to, subject) => {
	  return new Promise((resolve, reject) => {
		// Assuming the template file is in the same directory as EmailService.js
		const templatePath = path.resolve(__dirname, templateName);
  
		readHTMLFile(templatePath, async function (err, html) {
		  if (err) {
			console.log(err);
			return reject(err);
		  }
  
		  var template = await handlebars.compile(html);
		  htmlToSend = template(replacements);
		  var mailOptions = {
			from: from,
			to: to,
			subject,
			html: htmlToSend
		  };
		  transporter.sendMail(mailOptions, (error, info) => {
			if (error) {
			  return reject(error);
			}
			return resolve(info);
		  });
		});
	  });
	},
  };
  



