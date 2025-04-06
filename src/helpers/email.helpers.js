const fs = require('fs-extra');
const ejs = require('ejs');
const { join } = require('path');
const { createEmailTransport } = require('../config/email.config');
const { logError, logger } = require('../utils/logger');

// Function to send email using the transport
const sendEmail = async (data) => {
  const emailTransporter = createEmailTransport();
  const { to, subject, html } = data;

  const emailObj = {
    from: process.env.MAIL_FROM_EMAIL,
    to,
    subject,
    html,
  };

  try {
    // Send the email
    const result = await emailTransporter.sendMail(emailObj);
    logger.info(`Email sent successfully to ${to} with messageId: ${result.messageId}`);
    return result.messageId;
  } catch (error) {
    logError(`Error sending email to ${to}: ${error.message}`);
    throw new Error(`Error sending email to ${to}: ${error.message}`);
  }
};

// Utility function to render an EJS template
const renderEjsTemplate = async (templateName, variables) => {
  try {
    const templatePath = join(__dirname, '../templates', `${templateName}.ejs`);
    const templateContent = await fs.readFile(templatePath, 'utf-8');
    return ejs.render(templateContent, variables);
  } catch (error) {
    logError(`Error rendering EJS template ${templateName}: ${error.message}`);
    throw new Error(`Error rendering EJS template ${templateName}: ${error.message}`);
  }
};

// Function to send a welcome email
// Function to send an OTP email
const sendOtpEmail = async (email, otp) => {
  try {
    const htmlContent = await renderEjsTemplate('send-otp', { email, otp });
    await sendEmail({
      to: email,
      subject: 'Your MYUsta OTP Code',
      html: htmlContent,
    });
    logger.info(`OTP email successfully sent to: ${email}`);
  } catch (error) {
    logError(`Error sending OTP email to ${email}: ${error.message}`);
  }
};



module.exports = {
  sendOtpEmail,
};
