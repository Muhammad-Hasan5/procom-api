import { Resend } from "resend";

const resend = new Resend("re_3V3dHjZz_B25Zf5Th9eXFCr8XnP6HfF8X");

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
