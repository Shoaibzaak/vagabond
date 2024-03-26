
   
   {/*   this code is commited due to vercel issue of not sending the html templates it's not code issue  */}

// var nodeMailer = require("nodemailer");
// const fs = require("fs");
// const handlebars = require("handlebars");

// var transporter = nodeMailer.createTransport({
//   host: "smtp.gmail.com",
//   port: 465,
//   secure: true,
//   auth: {
//     user: `${process.env.MAILER_USER}`,
//     pass: `${process.env.MAILER_PASSWORD}`,
//   },
// });
// let from = "no-reply <vagabond.co.usa>"

// var readHTMLFile = function (path, callback) {
// 	fs.readFile(path, { encoding: "utf-8" }, function (err, html) {
// 	  if (err) {
// 	    callback(err);
// 	  } else {
// 	    callback(null, html);
// 	  }
// 	});
// };

// module.exports = {
// 	sendEmail: (tempateName, replacements, to, subject) => {
// 	//   const { sender, recipients, subject, html, text } = payload;
	
// 	  return new Promise((resolve, reject) => {
// 			readHTMLFile( tempateName, async function (err, html) {
// 		if (err) {
// 			console.log(err);
// 			return;
// 		}
   
// 	  	var template = await handlebars.compile(html);
// 	  	htmlToSend = template(replacements);
// 		  var mailOptions = {
// 			from: from,
// 			to: to,
// 			subject,
// 			html: htmlToSend
// 		  };
// 	  	transporter.sendMail(mailOptions, (error, info) => {
// 			if (error) {
// 			  return reject(error);
// 			}
// 			return resolve(info);
// 		  });
// 	});
// 	  });
// 	},
//   };
  

const nodeMailer = require("nodemailer");
const handlebars = require("handlebars");

const transporter = nodeMailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
	user: `${process.env.MAILER_USER}`,
	pass: `${process.env.MAILER_PASSWORD}`,
  },
});

const from = "no-reply <vagabond.co.usa>";

module.exports = {
  sendEmail: (htmlContent, replacements, to, subject) => {
	return new Promise((resolve, reject) => {
	  const template = handlebars.compile(htmlContent);
	  const htmlToSend = template(replacements);
	  const mailOptions = {
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
  }
};


