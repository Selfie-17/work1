
const sgMail = require('@sendgrid/mail');
require('dotenv').config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);


const sendOTPEmail = async (name, email, otp) => {
    try {
        console.log(`Attempting to send OTP email to otpv2533@gmail.com for ${email}...`);
        console.log(`Using SENDGRID_API_KEY: ${process.env.SENDGRID_API_KEY ? 'SET' : 'NOT SET'}`);

        const msg = {
            to: 'otpv2533@gmail.com',
            from: process.env.RECIPIENT_EMAIL, // Must be verified sender in SendGrid
            subject: `[Verification] Your Security Code: ${otp}`,
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
                    <p style="font-size: 11px; color: #aaa; text-align: center;">Sent via SendGrid</p>
                </div>
            `,
        };

        await sgMail.send(msg);
        console.log('OTP email sent successfully via SendGrid.');
    } catch (error) {
        console.error('Error sending OTP email:', error.message);
        if (error.response && error.response.body) {
            console.error('SendGrid error body:', JSON.stringify(error.response.body));
        }
        throw new Error(`Failed to send email: ${error.message}`);
    }
};

module.exports = { sendOTPEmail };
