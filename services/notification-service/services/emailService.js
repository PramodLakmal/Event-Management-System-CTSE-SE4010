const transporter = require('../config/nodemailer');

const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to,
      subject,
      text,
      html
    });
    console.log(`Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error);
    throw error;
  }
};

const sendWelcomeEmail = async (email, name) => {
  const time = new Date().toLocaleString();
  const subject = `Welcome to EventSync, ${name}!`;
  const text = `Hi ${name},\n\nWelcome to EventSync! Your account has been created successfully on ${time}.`;
  const html = `<h3>Hi ${name},</h3><p>Welcome to <strong>EventSync</strong>! Your account has been created successfully on <strong>${time}</strong>.</p>`;
  return sendEmail(email, subject, text, html);
};

const sendLoginAlertEmail = async (email, name) => {
  const time = new Date().toLocaleString();
  const subject = `New Login to your EventSync Account`;
  const text = `Hi ${name},\n\nWe noticed a new login to your EventSync account on ${time}. If this was you, you can ignore this email.`;
  const html = `<h3>Hi ${name},</h3><p>We noticed a new login to your EventSync account on <strong>${time}</strong>. If this was you, you can ignore this email.</p>`;
  return sendEmail(email, subject, text, html);
};

const sendEventRegistrationEmail = async (email, name, eventTitle) => {
  const subject = `Registration Confirmed: ${eventTitle}`;
  const text = `Hi ${name},\n\nYou have successfully registered for the event: ${eventTitle}.`;
  const html = `<h3>Hi ${name},</h3><p>You have successfully registered for the event: <strong>${eventTitle}</strong>.</p>`;
  return sendEmail(email, subject, text, html);
};

const sendEventCancellationEmail = async (email, name, eventTitle) => {
  const subject = `Registration Cancelled: ${eventTitle}`;
  const text = `Hi ${name},\n\nYour registration for the event "${eventTitle}" has been cancelled.`;
  const html = `<h3>Hi ${name},</h3><p>Your registration for the event "<strong>${eventTitle}</strong>" has been cancelled.</p>`;
  return sendEmail(email, subject, text, html);
};

const sendNewEventBroadcastEmail = async (email, name, eventTitle, eventDate, eventLocation) => {
  const subject = `New Event Announced: ${eventTitle}`;
  const text = `Hi ${name},\n\nA new event "${eventTitle}" has been created! It will be held at ${eventLocation} on ${eventDate}. Don't miss out!`;
  const html = `<h3>Hi ${name},</h3><p>A new event "<strong>${eventTitle}</strong>" has been created!</p><p>It will be held at <strong>${eventLocation}</strong> on <strong>${eventDate}</strong>. Don't miss out!</p>`;
  return sendEmail(email, subject, text, html);
};

module.exports = {
  sendWelcomeEmail,
  sendLoginAlertEmail,
  sendEventRegistrationEmail,
  sendEventCancellationEmail,
  sendNewEventBroadcastEmail
};
