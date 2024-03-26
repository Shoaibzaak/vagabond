// const nodeMailer = require("nodemailer");
// const fs = require("fs").promises;
// const handlebars = require("handlebars");

// const transporter = nodeMailer.createTransport({
//   host: "smtp.gmail.com",
//   port: 465,
//   secure: true,
//   auth: {
//     user: process.env.MAILER_USER,
//     pass: process.env.MAILER_PASSWORD,
//   },
// });

// const from = "no-reply <vagabond.co.usa>";

// const readHTMLFile = async (path) => {
//   try {
//     const html = await fs.readFile(path, { encoding: "utf-8" });
//     return html;
//   } catch (err) {
//     throw err;
//   }
// };

// module.exports = {
//   sendEmail: async (templateName, replacements, to, subject, isHTML = false) => {
//     try {
//       let content;
//       if (isHTML) {
//         const html = await readHTMLFile(templateName);
//         const template = handlebars.compile(html);
//         content = template(replacements);
//       } else {
//         content = templateName; // Assuming plain text message
//       }

//       const mailOptions = {
//         from: from,
//         to: to,
//         subject,
//         [isHTML ? 'html' : 'text']: content,
//       };

//       const info = await transporter.sendMail(mailOptions);
//       return info;
//     } catch (error) {
//       throw error;
//     }
//   },
// };
   
   {/*   this code is commited due to vercel issue of not sending the html templates it's not code issue  */}

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
   