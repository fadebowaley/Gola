const nodemailer = require("nodemailer");
const path = require("path");
const ejs = require("ejs");
const User = require("../models/user");


//fecth user data from the Database
const fetchUserData = async (userID) => {
  try {
    // Fetch user data from the database by iD
    const user = await User.findById(userID);
    return user;
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
};

const fetchUserShipping = async (userID) => {
  try {
    // Assuming `guest` is a Mongoose model or another database access layer
    const shipping = await Guest.find({ user: userID });
    return shipping; // Return the fetched shipping data
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
};

const shouldShowShippingAddress = async (order) => {
  try {
    const hasFoodOrMarket = await order.items.some((item) => {
      return (
        item.productType.includes("food") || item.productType.includes("market")
      );
    });
    return !hasFoodOrMarket;
  } catch (error) {
    console.log(error);
    throw error;
  }
};





// set up transporter
const transporter = nodemailer.createTransport({
  service: "sendinblue",
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
  host: process.env.MAIL_SERVER,
  port: process.env.MAIL_PORT,
});

//Email to send welcome message to users : immediately
const sendWelcomeEmail = async (email, username) => {
  try {
    const templatePath = path.join(
      __dirname,
      "../views/emails/emailWelcome.ejs"
    );
    const html = await ejs.renderFile(templatePath, { username });

    await transporter.sendMail({
      from: process.env.DEFAULT_SENDER,
      to: email,
      subject: "Welcome to CRM Community",
      html: html,
    });
  } catch (error) {
    console.error("Error verifying email:", error);
    //throw error;
    return;
  }
};

//Email to send birthday messages to users on Birthday @ :00:00
const sendBirthdayEmail = async (email, username) => {
  try {
    const templatePath = path.join(
      __dirname,
      "../views/emails/emailBirthday.ejs"
    );
    const html = await ejs.renderFile(templatePath, { username });

    await transporter.sendMail({
      from: process.env.DEFAULT_SENDER,
      to: email,
      subject: "Activate your account",
      html: html,
    });
  } catch (error) {
    console.error("Error verifying email:", error);
    //throw error;
    return;
  }
};

//Email to send verification email to user
const sendVerificationEmail = async (token, email, username) => {
  try {
    const templatePath = path.join(
      __dirname,
      "../views/emails/emailActivate.ejs"
    );
    const html = await ejs.renderFile(templatePath, { token, username });

    await transporter.sendMail({
      from: process.env.DEFAULT_SENDER,
      to: email,
      subject: "🚀 Activate your account",
      html: html,
    });
  } catch (error) {
    console.error("Error verifying email:", error);
    //throw error;
    return;
  }
};

//Email function for password reset for Email
const sendResetPasswordEmail = async (token, email, username) => {
  try {
    const templatePath = path.join(
      __dirname,
      "../views/emails/emailPasswordReset.ejs"
    );
    const html = await ejs.renderFile(templatePath, { token, username });

    await transporter.sendMail({
      from: process.env.DEFAULT_SENDER,
      to: email,
      subject: "🚀 Get Back into Your Account",
      html: html,
    });
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
};

//Email function to send order completion:Invoice for the successful order
const sendOrderCompletion = async (order) => {
  try {
    const templatePath = path.join(
      __dirname,
      "../views/emails/emailCompletedOrder.ejs"
    );

    const { user } = order;
    const userData = await fetchUserData(user);
    const shipping = await fetchUserShipping(user);
    const showShippingAddress = shouldShowShippingAddress(order);


    const html = await ejs.renderFile(templatePath, {
      userData,
      order,
      shipping,
      showShippingAddress,
    });

    await transporter.sendMail({
      from: process.env.ORDER_SENDER,
      to: userData.email,
      subject: `RCCG Hospitality Order Summary #${order.paymentId}`,
      html: html,
    });

    console.log("Order completion email sent successfully.");
  } catch (error) {
    console.error("Error sending order completion email:", error);
    if (
      error.code === "EPROTOCOL" &&
      error.responseCode === 421 &&
      error.response === "421 Service not available"
    ) {
      return;
    }
    //setTimeout(sendOrderCompletionEmail, 60000); // Retry after 1 minute
  }
};



const sendContactFormEmail = async (name, email, phone, subject, message) => {
  try {
    // send mail with defined transport object
    await transporter.sendMail({
      from: process.env.ADMIN_EMAIL,
      to: process.env.FEEDBACK_EMAIL,
      subject: "New contact form submission",
      html: `
        <h3>New Equiry Form  Submission </h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Email:</strong> ${phone}</p>
        <p><strong>Email:</strong> ${subject}</p>
        <p><strong>Message:</strong> ${message}</p>
      `,
    });
  } catch (error) {
    console.log(error);
  }
};




module.exports = {
  sendResetPasswordEmail,
  sendContactFormEmail,
  sendVerificationEmail,
  sendOrderCompletion,
  sendBirthdayEmail,
  sendWelcomeEmail
};


