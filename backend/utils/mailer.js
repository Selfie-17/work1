const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendOTPEmail = async (name, email, otp) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email, // Send OTP to the user's email address
        subject: `[Verification] Your Security Code: ${otp}`,
        text: `Hello ${name},\n\nYour one-time verification code is: ${otp}\n\nThis code was requested for: ${email}\nIf you did not request this, please ignore this email.\n\nBest regards,\nYour App Team`,
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #333;">Security Verification</h2>
                <p>Hello <strong>${name}</strong>,</p>
                <p>Use the following code to complete your registration:</p>
                <div style="background: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #007bff; border-radius: 5px; margin: 20px 0;">
                    ${otp}
                </div>
                <p style="font-size: 12px; color: #666;">This code was requested for entry with: <strong>${email}</strong></p>
                <p style="font-size: 12px; color: #999;">If you did not request this, please ignore this email. This code will expire in 10 minutes.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin-top: 20px;">
                <p style="font-size: 11px; color: #aaa; text-align: center;">Sent via Gmail Secure SMTP</p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('OTP email sent successfully via Gmail SMTP');
    } catch (error) {
        console.error('Error sending OTP email via Gmail:', error);
        throw error;
    }
};

module.exports = { sendOTPEmail };
