import { Request, Response } from "express";
import { prisma } from "../app";
import { generateReportPDF } from "../utils/generatePdf";
import path from "path";
import fs from "fs";

/**
 * Serves the verified PDF report with a watermark.
 */
export const getVerifiedReport = async (req: Request, res: Response) => {
    const { obNumber } = req.params;

    try {
        const reportData = await prisma.sub_module_data.findFirst({
            where: { ob_number: obNumber },
        });

        if (!reportData) {
            return res.status(404).json({ message: "Report not found" });
        }

        const filePath = path.join(__dirname, `../../../reports/report_${obNumber}_VALID.pdf`);
        const qrUrl = `https://main-ob.virtualpolicestation.com/api/v1/sub_module_data/view-report/${obNumber}`;



        // const filePath = path.join(__dirname, `../../../reports/report_${obNumber}_VALID.pdf`);
        // const qrUrl = `https://ob-main.virtualpolicestation.com/reports/${obNumber}`;
        // const qrUrl = `https://ob-main.virtualpolicestation.com/reports/${ob_number}`;

        // Generate watermarked PDF if it doesn't exist
        if (!fs.existsSync(filePath)) {
            await generateReportPDF(reportData, filePath, qrUrl, true);
        }

        res.sendFile(filePath);
    } catch (error) {
        console.error("Error generating verified report:", error);
        res.status(500).json({ message: "Error retrieving report" });
    }
};

