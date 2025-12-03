import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY as string);

export const sendEmail = async ({
	to,
	subject,
	html,
}: {
	to: string;
	subject: string;
	html: string;
}) => {
	try {
		const response = await resend.emails.send({
			from: `${process.env.SENDER_NAME} <${process.env.SENDER_EMAIL}>`,
			to,
			subject,
			html,
		});

		console.log("Email sent:", response);
		return response;
	} catch (error) {
		console.log("Error email sending:", error);
		throw error;
	}
};
