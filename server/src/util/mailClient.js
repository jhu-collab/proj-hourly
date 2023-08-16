import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  pool: true,
  maxMessages: Infinity,
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

export default transporter;
