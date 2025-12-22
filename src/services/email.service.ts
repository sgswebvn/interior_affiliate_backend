import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export const sendEmail = async (to: string, subject: string, html: string) => {
    try {
        if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
            console.warn('SMTP credentials not set. Email not sent.');
            return false;
        }

        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM || '"Affiliate System" <no-reply@example.com>',
            to,
            subject,
            html,
        });

        console.log('Message sent: %s', info.messageId);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};
