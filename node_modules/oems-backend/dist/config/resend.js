"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = sendEmail;
const resend_1 = require("resend");
const env_js_1 = require("./env.js");
const resendClient = env_js_1.config.resendApiKey ? new resend_1.Resend(env_js_1.config.resendApiKey) : null;
async function sendEmail({ to, subject, html, text }) {
    if (resendClient) {
        try {
            const response = await resendClient.emails.send({
                from: env_js_1.config.fromEmail,
                to,
                subject,
                html,
                text
            });
            console.log(`[Resend Email Sent] to ${to}: ${subject}`, response);
            return { success: true, data: response };
        }
        catch (error) {
            console.error('[Resend Email Error]', error);
            return { success: false, error };
        }
    }
    else {
        console.log(`[Mock Email Logger - Resend Key Not Configured]`);
        console.log(`To: ${to}`);
        console.log(`Subject: ${subject}`);
        console.log(`Body: ${text || html}`);
        return { success: true, mock: true };
    }
}
