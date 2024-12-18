//Verify Payment before sending data into the Background
const { sendResetPasswordEmail, sendVerificationEmail, sendOrderCompletion, sendContactFormEmail } = require("../middleware/email");



const sendPasswordResetEmailInBackground = async (token, email) => {
  try {
   sendResetPasswordEmail(token, email);
    console.log("Password reset email sent in the background");
  } catch (error) {
    console.error("Error sending password reset email in background:", error);
  }
};




const sendVerificationEmailInBackground = async (token, email, usernane) => {
  try {
   sendVerificationEmail(token, email, usernane);
    console.log("verification email sent in the background");
  } catch (error) {
    console.error("Error sending password reset email in background:", error);
  }
};



const sendOrderEmailInBackground = async ( order ) => {
  try {
    sendOrderCompletion(order);    
    console.log("Order Completed  email sent in the background");
  } catch (error) {
    console.error("Error sending order completion email in background:", error);
  }
};

const sendContacFormInBackground = async (
  fullName,
  email,
  phone,
  subject,
  subjectSpec,
  message
) => {
  try {
    sendContactFormEmail(fullName, email, phone, subject, subjectSpec, message);
    console.log("Message  Form sent in the background");
  } catch (error) {
    console.error("Error contact Form email in background:", error);
  }
};




module.exports = {
  sendPasswordResetEmailInBackground,
  sendVerificationEmailInBackground,
  sendOrderEmailInBackground,
  sendContacFormInBackground
};
