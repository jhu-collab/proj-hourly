import nodemailer from "nodemailer";
import prisma from "../../prisma/client.js";
import schedule from "node-schedule";

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
    to: req.email, // req.email, // list of receivers (who receives)
    subject: req.subject, // Subject line
    text: req.text, // plaintext body
    html: req.html, // html body
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
      return "stop";
    }

    console.log("Message sent: " + info.response);
  });
};

export default sendEmail;

export const sendEmailForEachRegistrationWhenCancelled = (registrations) => {
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
};

export const sendEmailForEachRegistrationWhenChanged = (
  registrations,
  editedOfficeHour
) => {
  registrations.forEach(async (registration) => {
    const account = await prisma.Account.findFirst({
      where: {
        id: registration.accountId,
      },
    });

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
};

export const sendReminderEmailRegistration = async (registrationId) => {
  const registration = await prisma.registration.findUnique({
    where: {
      id: registrationId,
    },
    include: {
      officeHour: true,
      account: true,
      topics: true,
    },
  });
  if (
    registration === null ||
    registration === undefined ||
    registration.isCancelled ||
    registration.isCancelledStaff
  ) {
    return;
  } else {
    const dateObj = new Date(registration.date);
    const startTimeObj = new Date(registration.startTime);
    const endTimeObj = new Date(registration.endTime);
    dateObj.setUTCHours(startTimeObj.getUTCHours());
    dateObj.setUTCMinutes(startTimeObj.getUTCMinutes());
    if (endTimeObj < startTimeObj) {
      endTimeObj.setUTCDate(endTimeObj.getUTCDate() + 1);
    }
    const officeHour = await prisma.officeHour.findUnique({
      where: {
        id: registration.officeHour.id,
      },
      include: {
        course: true,
        hosts: true,
      },
    });
    var options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    var topics =
      registration.topics.length > 0
        ? registration.topics.map((topic) => topic.value)
        : "No topics selected.";
    const userEmail = registration.account.email;
    const fullName =
      registration.account.firstName + " " + registration.account.lastName;
    const courseTitle = officeHour.course.title;
    const courseNumber = officeHour.course.courseNumber;
    const location = registration.officeHour.location;
    const hostFullName =
      officeHour.hosts[0].firstName + " " + officeHour.hosts[0].lastName;
    const today = new Date();
    const emailStartTime = startTimeObj.toLocaleString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
    const emailEndTime = endTimeObj.toLocaleString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
    dateObj.setUTCMinutes(
      dateObj.getUTCMinutes() - dateObj.getTimezoneOffset()
    );
    const dateStr = dateObj.toLocaleDateString("en-US", options);

    const donotreply = "--- Do not reply to this email ---";
    let subject =
      "[" +
      courseNumber +
      "] Reminder: Registration for " +
      hostFullName +
      "'s" +
      " office hours from " +
      emailStartTime +
      " to " +
      emailEndTime +
      "!";
    let emailBody =
      donotreply +
      "\n\n" +
      "Dear " +
      fullName +
      "," +
      "\n\n" +
      "You have an upcoming office hour registration for " +
      courseTitle +
      " office hours from " +
      emailStartTime +
      " to " +
      emailEndTime +
      " on " +
      dateStr +
      " at " +
      location +
      "!" +
      "\n\nTopics: " +
      topics +
      "\n\n" +
      "Thanks,\n" +
      "The Hourly Team\n\n" +
      donotreply;
    let emailReq = {
      email: userEmail,
      subject: subject,
      text: emailBody,
    };
    sendEmail(emailReq);
  }
};

export const scheduleReminderEmailRegistration = async (registrationId) => {
  const registration = await prisma.registration.findUnique({
    where: {
      id: registrationId,
    },
    include: {
      officeHour: true,
    },
  });
  const course = await prisma.course.findUnique({
    where: {
      id: registration.officeHour.courseId,
    },
  });
  if (course.emailReminders) {
    const startTime = new Date(registration.startTime);
    const dateObj = new Date(registration.date);
    dateObj.setUTCHours(startTime.getUTCHours());
    dateObj.setUTCMinutes(startTime.getUTCMinutes());
    dateObj.setUTCMinutes(dateObj.getUTCMinutes() - course.reminderInterval);
    schedule.scheduleJob(
      dateObj,
      function (registrationId) {
        sendReminderEmailRegistration(registrationId);
      }.bind(null, registrationId)
    );
  }
};
