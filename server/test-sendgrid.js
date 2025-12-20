const sgMail = require('@sendgrid/mail');
require('dotenv').config();

console.log('Using API Key:', process.env.SENDGRID_API_KEY ? 'Present' : 'MISSING');
console.log('From/To Email:', process.env.RECIPIENT_EMAIL);

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const msg = {
    to: process.env.RECIPIENT_EMAIL,
    from: process.env.RECIPIENT_EMAIL,
    subject: 'SendGrid Test Diagnostic',
    text: 'If you receive this, your SendGrid configuration is working correctly.',
    html: '<strong>If you receive this, your SendGrid configuration is working correctly.</strong>',
};

sgMail
    .send(msg)
    .then(() => {
        console.log('SUCCESS: Email sent successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('FAILURE: Error detected:');
        if (error.response) {
            console.error('Status Code:', error.response.statusCode);
            console.error('Error Body:', JSON.stringify(error.response.body, null, 2));
        } else {
            console.error(error.message);
        }
        process.exit(1);
    });
