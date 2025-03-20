import nodemailer from "nodemailer";

/**
 * Sends the generated report PDF via email.
 * @param userEmail - The recipient's email.
 * @param filePath - Path to the generated PDF.
 * @param obNumber - OB number of the report.
 */
export const sendReportEmail = async (userEmail: string, filePath: string, obNumber: string) => {
    try {
        console.log("====================================");
        console.log(process.env.SMTP_PASSWORD, userEmail, "userEmail");
        console.log("====================================");
        // ✅ Ensure SMTP credentials exist
        if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
            console.error("SMTP credentials are missing. Check your .env file.");
            throw new Error("SMTP credentials not configured.");
        }

        // ✅ Setup Nodemailer Transporter
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || "587"),
            secure: process.env.SMTP_PORT === "465", // Use SSL for port 465
            auth: {
                user: process.env.SMTP_USER,
                pass: "Vps@2023#",
            },
        });

        // ✅ Email content
        const mailOptions = {
            from: process.env.SMTP_FROM || process.env.SMTP_USER, // Use configured sender or fallback to SMTP_USER
            to: userEmail,
            subject: `Report - OB Number: ${obNumber}`,
            text: `Dear User,\n\nPlease find attached your report with OB Number: ${obNumber}.\n\nBest regards,\nNational Police Service`,
            attachments: [
                {
                    filename: `report_${obNumber}.pdf`,
                    path: filePath,
                    contentType: "application/pdf",
                },
            ],
        };

        // ✅ Send Email
        await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent successfully to ${userEmail}`);
    } catch (error) {
        console.error("❌ Error sending email:", error);
    }
};
