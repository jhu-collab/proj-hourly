import nodemailer from "nodemailer";

export const sendEmail = async (req) => {
  // Create the transporter with the required configuration for Outlook
  // change the user and pass !
  var transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST, // hostname
    secureConnection: false, // TLS requires secureConnection to be false
    port: 587, // port for secure SMTP
    tls: {
      ciphers: "SSLv3",
    },
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // setup e-mail data, even with unicode symbols
  var mailOptions = {
    from: '"Hourly " ' + process.env.EMAIL, // sender address (who sends)
    to: req.email, // list of receivers (who receives)
    subject: req.subject, // Subject line
    text: req.text, // plaintext body
    html: req.html, // html body
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      return console.log(error);
    }

    console.log("Message sent: " + info.response);
  });
};

export default sendEmail;
