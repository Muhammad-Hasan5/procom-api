import Mailgen from "mailgen";
import nodemailer from "nodemailer";
import { MailtrapTransport } from "mailtrap";
export const sendEmail = async (params) => {
    const mailGenerator = new Mailgen({
        theme: "neopolitan",
        product: {
            name: "Notion-lite",
            link: "http://Notion-lite.com",
        },
    });
    const textEmail = mailGenerator.generatePlaintext(params.mailgenContent);
    const HTML_Email = mailGenerator.generate(params.mailgenContent);
    const transport = nodemailer.createTransport(MailtrapTransport({
        token: process.env.MAILTRAP_TOKEN,
    }));
    try {
        await transport.sendMail({
            from: "team@notionlite.com",
            to: params.email,
            subject: params.subject,
            text: textEmail,
            html: HTML_Email,
        });
    }
    catch (error) {
        console.error("Error sending email, maybe mailtrap api issue", error);
    }
};
export const emailVerificationMailgenContent = (username, verificationURL) => {
    return {
        body: {
            name: username,
            intro: "Welcome to Notion-lite, We're happy to have you on board.",
            action: {
                instructions: "To get started with Notion-lite, please click here: ",
                button: {
                    color: "#22BC66",
                    text: "Verify your email",
                    link: verificationURL,
                },
            },
            outro: "Need help, or have questions? Just reply to this email, we'd love to help.",
        },
    };
};
export const passwordForgotMailgenContent = (username, resetPasswordURL) => {
    return {
        body: {
            name: username,
            intro: "Want to reset your password?",
            action: {
                instructions: "Click below to set new password",
                button: {
                    color: "#22BC66",
                    text: "Reset password",
                    link: resetPasswordURL,
                },
            },
            outro: "Need help, or have questions? Just reply to this email, we'd love to help.",
        },
    };
};
