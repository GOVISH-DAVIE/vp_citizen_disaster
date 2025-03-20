import { Router } from "express";
import {
    createSubModuleData,
    getAllSubModuleData,
    getSubModuleDataById,
    updateSubModuleData,
    deleteSubModuleData,
    getUserApplications
} from "../../controllers/sub_module_data";
import { upload } from '../../middleware/multer';
import path from "path";
import { generateReportPDF } from "../../utils/generatePdf";
import { prisma } from "../../app";
import fs from "fs";
// import passport from "passport";
const SubModuleDataRouter = Router();

SubModuleDataRouter.post("/", upload.any(), createSubModuleData);
// SubModuleDataRouter.get("/", getUserApplications);
SubModuleDataRouter.get("/", getAllSubModuleData);
SubModuleDataRouter.get("/:id", getSubModuleDataById);
SubModuleDataRouter.put("/:ob_number", updateSubModuleData);
// SubModuleDataRouter.
SubModuleDataRouter.delete("/:id", deleteSubModuleData);




SubModuleDataRouter.get('/view-report/:obNumber', async (req, res) => {
    try {
        console.log("view-report");
        const { obNumber } = req.params;
        const { validated } = req.query;

        const reportsDir = path.join(__dirname, '../../../reports');
        const fileName = validated == 'true' || validated ? `report_${obNumber.replace(/-/g, '-')}_VALID.pdf` : `report_${obNumber.replace(/-/g, '-')}.pdf`;
        const filePath = path.join(reportsDir, fileName);

        // Check if the requested PDF exists
        if (fs.existsSync(filePath)) {
            // Fetch the latest subModuleData from the database
            const subModuleData = await prisma.sub_module_data.findMany({
                where: { ob_number: obNumber.replace(/-/g, '/') },
                include: {
                    ip_rs_person: true,
                    sub_module: {
                        include: {
                            module: true, // Fetch module details
                        },
                    },
                },
            });
            const reportData = subModuleData.reduce((acc, item) => {
                acc[item.ob_number] = acc[item.ob_number] || [];
                acc[item.ob_number].push(item);
                return acc;
            }, {});

            if (!reportData) {
                return res.status(404).json({ message: 'No data found for this OB Number' });
            }

            // Generate the QR code URL
            const qrUrl = `https://main-ob.virtualpolicestation.com/api/v1/sub_module_data/view-report/${obNumber}?validated=true`;

            // Determine whether to include a watermark
            const includeWatermark = validated === 'true';

            // Generate the PDF with or without watermark
            await generateReportPDF(reportData, filePath, qrUrl, includeWatermark).then(() => {
                new Promise((resolve, reject) => {
                    setTimeout(() => {

                        res.sendFile(filePath);
                        resolve(true);
                    }, 500);
                })
                    .then(() => {
                        setTimeout(() => {
                            fs.unlinkSync(filePath);
                        }, 500);
                    });

            });
        } else {
            const subModuleData = await prisma.sub_module_data.findMany({
                where: { ob_number: obNumber.replace(/-/g, '/') },
                include: {
                    ip_rs_person: true,
                    sub_module: {
                        include: {
                            module: true, // Fetch module details
                        },
                    },
                },
            });
            const reportData = subModuleData.reduce((acc, item) => {
                acc[item.ob_number] = acc[item.ob_number] || [];
                acc[item.ob_number].push(item);
                return acc;
            }, {});
            const includeWatermark = validated === 'true';
            console.log(reportData, "reportData");
            const qrUrl = `https://main-ob.virtualpolicestation.com/api/v1/sub_module_data/view-report/${obNumber}?validated=true`;
            await generateReportPDF(reportData, filePath, qrUrl, includeWatermark).then(() => {
                
                new Promise((resolve, reject) => {
                    setTimeout(() => {

                        res.sendFile(filePath);
                        resolve(true);
                    }, 500);
                })
                    .then(() => {
                        setTimeout(() => {
                            fs.unlinkSync(filePath);
                        }, 500);
                    });

            });


            // return res.sendFile(filePath);
        }

        // Serve the requested PDF 
    } catch (error) {
        console.error('Error serving the report:', error);
        return res.status(500).json({ message: 'An error occurred while processing the report' });
    }
});

export { SubModuleDataRouter };
