const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendVerificationEmail = (toEmail, code) => {
  return transporter.sendMail({
    from: `"E-SANTÉ" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Code de vérification - E-Santé',
    html: `
      <div style="font-family: Arial, sans-serif; border: 1px solid #e2e8f0; padding: 20px; border-radius: 10px;">
        <h2 style="color: #3182ce;">Bienvenue sur E-Santé</h2>
        <p>Voici votre code de validation pour activer votre compte :</p>
        <div style="font-size: 32px; font-weight: bold; color: #2d3748; letter-spacing: 5px; background: #f7fafc; padding: 10px; display: inline-block;">
          ${code}
        </div>
      </div>
    `
  });
};

module.exports = sendVerificationEmail;