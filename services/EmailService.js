var nodeMailer = require("nodemailer");
const fs = require("fs");
const handlebars = require("handlebars");

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
const emailTemplate = fs.readFileSync('./emailTemplates/otpVerification.html', 'utf-8');
// var readHTMLFile = function (path, callback) {
// 	fs.readFile(path, { encoding: "utf-8" }, function (err, html) {
// 	  if (err) {
// 	    callback(err);
// 	  } else {
// 	    callback(null, html);
// 	  }
// 	});
// };

exports.sendEmail = async function ( replacements, to, subject) {
	// readHTMLFile("./emailTemplates/" + tempateName+".html", async function (err, html) {
	// 	if (err) {
	// 		console.log(err);
	// 		return;
	// 	}
   
	//   	var template = await handlebars.compile(html);
	//   	htmlToSend = template(replacements);
	  	await transporter.sendMail({
			from: from, // sender address e.g. no-reply@xyz.com or "Fred Foo 👻" <foo@example.com>
			to: to, // list of receivers e.g. bar@example.com, baz@example.com
			subject: subject, // Subject line e.g. 'Hello ✔'
			html: emailTemplate.replace('{otp}', replacements) // html body e.g. '<b>Hello world?</b>'
		}).then((info) => {
			console.log(info);
		}).catch((err) => {
			console.log(err);
		});
	// });
}

