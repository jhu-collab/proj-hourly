import { NOT_ACCEPTABLE } from "http-status-codes";
import nodemailer from "nodemailer";
import prisma from "../../prisma/client.js";
import { factory } from "./debug.js";
import { transporter } from "./mailClient.js";

const debug = factory(import.meta.url);
export const sendEmail = async (req) => {
  debug("sendEmail called");
  // Create the transporter with the required configuration for Outlook
  // change the user and pass !
  debug("creating transport...");

  // setup e-mail data, even with unicode symbols
  var mailOptions = {
    from: '"Hourly " ' + process.env.EMAIL, // sender address (who sends)
    to: req.email, // req.email, // list of receivers (who receives)
    subject: req.subject, // Subject line
    text: req.text, // plaintext body
    html: req.html, // html body
  };

  // send mail with defined transport object
  debug("sending mail...");
  if ("true" === process.env.DISABLE_EMAIL_SENDING) {
    debug("emails are disabled - not sending");
    return;
  } else {
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
        return "stop";
      }
    });
    debug("sendEmail done!");
  }
};

export default sendEmail;

// export const sendEmailForEachRegistrationWhenCancelledBatch = async (registrations) => {
//   debug("sendEmailForEachRegistrationWhenCancelledBatch called!");
//   const emailPromises = registrations.map(async (registration) => {
//     const account = await prisma.Account.findFirst({
//       where: {
//         id: registration.accountId,
//       },
//     });
//     const text = `The office hours that you have registered for on ${registration.date} has been cancelled`;
//     const cancellationNotification = (email) => {
//       return {
//         email: email,
//         subject: `Office Hour Cancelled!`,
//         text,
//         html: "<p> " + text + " </p>",
//       };
//     };
//     await sendEmail(cancellationNotification(account.email));
//   });
//   await Promise.all(emailPromises);
//   debug("sendEmailForEachRegistrationWhenCancelled done!");
// };

export const sendEmailForEachRegistrationWhenCancelled = (registrations) => {
  debug("sendEmailForEachRegistrationWhenCancelled called!");
  registrations.forEach(async (registration) => {
    const account = await prisma.Account.findFirst({
      where: {
        id: registration.accountId,
      },
    });
    const text = `The office hours that you have registered for on ${registration.date} has been cancelled`;
    const cancellationNotification = (email) => {
      return {
        email: email,
        subject: `Office Hour Cancelled!`,
        text,
        html: "<p> " + text + " </p>",
      };
    };
    await sendEmail(cancellationNotification(account.email));
  });
  debug("sendEmailForEachRegistrationWhenCancelled done!");
};

//TODO: make sure to find a way to not depend on the prereq
//PREREQ: registration must include account, which can be achieved by select: {account: true} when fetching registrations
export const sendEmailForEachRegistrationWhenChanged = (
  registrations,
  editedOfficeHour
) => {
  debug("sendEmailForEachRegistrationWhenChanged called!");
  const accounts = [];
  registrations.forEach((registration) => {
    accounts.push(registration.account);
  });
  accounts.forEach(async (account) => {
    const text = `The office hours starting on ${new Date(
      editedOfficeHour.startDate
    ).toLocaleString()} to ${new Date(
      editedOfficeHour.endDate
    ).toLocaleString()} will now take place from ${new Date(
      editedOfficeHour.startDate
    ).toLocaleString()} to ${new Date(
      editedOfficeHour.endDate
    ).toLocaleString()} at ${
      editedOfficeHour.location
    }. Please reschedule your registration!`;
    const changeNotification = (email) => {
      return {
        email: email,
        subject: `Office Hour Changed!`,
        text,
        html: "<p> " + text + " </p>",
      };
    };
    await sendEmail(changeNotification(account.email));
  });
  debug("sendEmailForEachRegistrationWhenChanged done!");
};

export const sendEmailForEachRegistrationWhenLocationChanged = (
  registrations,
  editedOfficeHour
) => {
  const accounts = [];
  registrations.forEach((registration) => {
    accounts.push(registration.account);
  });
  accounts.forEach(async (account) => {
    const text = `The office hours starting on ${new Date(
      editedOfficeHour.startDate
    ).toLocaleString()} to ${new Date(
      editedOfficeHour.endDate
    ).toLocaleString()} will now take place at ${editedOfficeHour.location}.`;
    const changeNotification = (email) => {
      return {
        email: email,
        subject: `Office Hour Location Changed!`,
        text,
        html: "<p> " + text + " </p>",
      };
    };
    await sendEmail(changeNotification(account.email));
  });
};
