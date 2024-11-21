const nodemailer = require("nodemailer");
require("dotenv").config();

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: "smtp.mailgun.org",
            port: 587,
            secure: false,
            auth: {
                user: process.env.MAILTRAP_USER,
                pass: process.env.MAILTRAP_PASS,
            },
        });
    }

    async sendEmail(email, subject, html) {
        try {
            const mailOptions = {
                from: {
                    name: process.env.EMAIL_FROM_NAME || "Health Consultation",
                    address: process.env.EMAIL_FROM_ADDRESS || "noreply@healthconsult.com"
                },
                to: email,
                subject: subject,
                html: html,
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log("Email sent successfully:", info.messageId);
            return {
                success: true,
                messageId: info.messageId,
            };
        } catch (error) {
            console.error("Error sending email:", error);
            throw error;
        }
    }

    // Email templates
    getVerificationEmailTemplate(userName, verificationLink) {
        return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Email Verification</h2>
        <p>Hello ${userName},</p>
        <p>Thank you for registering. Please click the button below to verify your email address:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationLink}" 
             style="background-color: #4CAF50; color: white; padding: 12px 25px; 
                    text-decoration: none; border-radius: 4px;">
            Verify Email
          </a>
        </div>
        <p>If the button doesn't work, you can also click this link:</p>
        <p>${verificationLink}</p>
        <p>This link will expire in 24 hours.</p>
        <p>Best regards,<br>Your Health Consultation Team</p>
      </div>
    `;
    }

    getPasswordResetTemplate(userName, resetLink) {
        return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>Hello ${userName},</p>
        <p>We received a request to reset your password. Click the button below to create a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" 
             style="background-color: #4CAF50; color: white; padding: 12px 25px; 
                    text-decoration: none; border-radius: 4px;">
            Reset Password
          </a>
        </div>
        <p>If the button doesn't work, you can also click this link:</p>
        <p>${resetLink}</p>
        <p>This link will expire in 1 hour. If you didn't request this, please ignore this email.</p>
        <p>Best regards,<br>Your Health Consultation Team</p>
      </div>
    `;
    }
}

module.exports = new EmailService();