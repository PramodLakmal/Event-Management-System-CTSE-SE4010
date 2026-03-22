const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify connection configuration
transporter.verify(function(error, success) {
  if (error) {
    console.error('Nodemailer verification error:', error);
  } else {
    console.log('Nodemailer is ready to send messages');
  }
});

module.exports = transporter;
