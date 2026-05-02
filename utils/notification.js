import { configDotenv } from "dotenv";
import nodemailer from "nodemailer";
configDotenv();

export default async function sendNotification(toEmail, subject, text, html) {
    let transporter = nodemailer.createTransport({
        host: "smtp.mailgun.org",
        port: 587,
        secure: false,
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD,
        },
    });

    await transporter.sendMail({
        from: `"React Playground" <no-reply@reactpg.xyz>`,
        to: toEmail,
        subject: subject,
        text: text,
        html: html,
    });
}