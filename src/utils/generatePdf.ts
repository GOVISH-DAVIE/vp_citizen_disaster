import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import { IPRS_Person } from '@prisma/client';

/**
 * Generates a PDF police report with a QR code and optionally a watermark.
 * @param {Object} reportData - The details of the submitted report.
 * @param {string} filePath - The path where the PDF will be saved.
 * @param {string} qrUrl - The URL to be embedded in the QR code.
 * @param {boolean} watermark - Whether to include the "VALID" watermark.
 */
export const generateReportPDF = async (reportData, filePath, qrUrl, watermark = false) => {
    try {
        const obNumber = Object.keys(reportData)[0]; 
        const doc = new PDFDocument({ size: 'A4', margins: { top: 20, bottom: 20, left: 20, right: 20 } }); // Reduced margins
        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        

        // Title Section (Smaller Font Size)
        doc.fontSize(16).text('NATIONAL POLICE SERVICE', { align: 'center' }); // Reduced font size
        doc.moveDown(0.5); // Reduced spacing

        // Add Logo (Centered, Smaller Size)
        const logoPath = path.join(__dirname, '../../logo/logo.png');
        if (fs.existsSync(logoPath)) {
            const imageWidth = 80; // Reduced logo size
            const imageHeight = 80;
            const imageX = (doc.page.width - imageWidth) / 2;
            doc.image(logoPath, imageX, doc.y, { width: imageWidth, height: imageHeight });
            doc.moveDown(5); // Reduced spacing
        } else {
            console.warn('⚠️ Logo file not found, skipping image.');
        }

        // Subtitle (Smaller Font Size)
        doc.fontSize(14).text('THE KENYA NATIONAL POLICE SERVICE', { align: 'center' }); // Reduced font size
        doc.moveDown(1); // Reduced spacing
        doc.fontSize(12).text('REPORT OCCURRENCE FROM POLICE RECORDS', {align: 'center'}); // Reduced font size
        doc.moveDown(1); // Reduced spacing

        // IPRS Details (Smaller Font Size)
        if (reportData[obNumber][0].ip_rs_person) {
            const { first_name, last_name, phone_number, county, sub_county, email } = (reportData[obNumber][0].ip_rs_person as IPRS_Person);
            const leftColumnX = 50;
            const rightColumnX = doc.page.width / 2 + 20;
            let yPosition = doc.y;

            doc.fontSize(10).text(`Full Name: ${first_name} ${last_name}`, leftColumnX, yPosition, { width: 250 }); // Reduced font size
            doc.fontSize(10).text(`Phone: ${phone_number || 'N/A'}`, rightColumnX, yPosition, { width: 250 }); // Reduced font size
            yPosition += 15; // Reduced spacing

            doc.fontSize(10).text(`County: ${county || 'N/A'}`, leftColumnX, yPosition, { width: 250 }); // Reduced font size
            doc.fontSize(10).text(`Sub County: ${sub_county || 'N/A'}`, rightColumnX, yPosition, { width: 250 }); // Reduced font size
            yPosition += 15; // Reduced spacing

            doc.fontSize(10).text(`Email: ${email || 'N/A'}`, leftColumnX, yPosition, { width: 250 }); // Reduced font size
            doc.moveDown(1); // Reduced spacing
        } else {
            doc.fontSize(10).text('IPRS details not found'); // Reduced font size
            doc.moveDown(1); // Reduced spacing
        }

        // Incident Details (Smaller Font Size)
        doc.fontSize(12).text('Incident Details:', { underline: true }); // Reduced font size
        doc.moveDown(0.5); // Reduced spacing
        reportData[obNumber].forEach((item) => {
            const moduleName = item.sub_module.module.name || 'Unknown Module';
            doc.fontSize(10).text(`Incidence Category: ${moduleName}`); // Reduced font size
            if (item.formData && typeof item.formData === 'object') {
                Object.entries(item.formData).forEach(([key, value]) => {
                    doc.fontSize(10).text(`${key}: ${value !== null ? value : 'N/A'}`); // Reduced font size
                });
            } else {
                doc.fontSize(10).text('No details provided'); // Reduced font size
            }
            doc.moveDown(0.5); // Reduced spacing
        });

        // OB Number and Date (Smaller Font Size)
        doc.fontSize(10).text(`OB number: ${obNumber}`); // Reduced font size
        doc.fontSize(10).text(`Date: ${reportData[obNumber][0].submissionDate ? new Date(reportData[obNumber][0].submissionDate).toLocaleString() : 'Unknown'}`); // Reduced font size
        doc.moveDown(1); // Reduced spacing

        // Police Officer and Station (Smaller Font Size)
        doc.fontSize(10).text(`Police officer: ${reportData[obNumber][0].police_officer}`); // Reduced font size
        doc.fontSize(10).text(`Police station: ${reportData[obNumber][0].police_station}`); // Reduced font size
        doc.moveDown(1); // Reduced spacing

        // Generate QR Code (Smaller Size)
        // Add all content first (e.g., title, logo, IPRS details, incident details, etc.)

        // Generate QR Code
        const qrImage = await QRCode.toDataURL(qrUrl);
        const qrWidth = 100;
        const qrX = (doc.page.width - qrWidth) / 2;
        if (!watermark) {
            doc.image(qrImage, qrX, doc.y, { width: qrWidth });
        }

            // Add Watermark (Overlay on top of content)
            if (watermark) {
                // Save the current graphics state
                doc.save();

                // Define watermark properties
                const watermarkText = 'VALID';
                const watermarkFontSize = 145;
                const watermarkOpacity = 0.5; // Lower opacity for better readability
                const watermarkColor = 'red';

                // Set watermark styles
                doc.fontSize(watermarkFontSize)
                    .fillColor(watermarkColor)
                    .opacity(watermarkOpacity);

                // Calculate the position for the watermark
                const textWidth = doc.widthOfString(watermarkText);
                const textHeight = doc.currentLineHeight();
                const centerX = doc.page.width / 3; // Horizontal center - calculates the middle point of the page width
                const centerY = doc.page.height / 2; // Vertical center - calculates the middle point of the page height

                // Apply rotation and position, then add the watermark text
                doc.translate(centerX, centerY)
                    .rotate(320) // Rotate the watermark diagonally
                    .text(watermarkText, -textWidth / 2, -textHeight / 2, {
                        align: 'center',
                    });

                // Restore the graphics state to prevent affecting subsequent content
                doc.restore();

                // Reset fill color and opacity for further content
                doc.fillColor('black').opacity(1);
            }

            doc.end();
            stream.on('finish', () => console.log(`PDF generated at ${filePath}`));
        } catch (error) {
            console.error('Error generating PDF:', error);
            throw error;
        }
    };

// import PDFDocument from 'pdfkit';
// import QRCode from 'qrcode';
// import fs from 'fs';
// import path from 'path';
// import { IPRS_Person } from '@prisma/client';

// /**
//  * Generates a PDF police report with a QR code and optionally a watermark.
//  * @param {Object} reportData - The details of the submitted report.
//  * @param {string} filePath - The path where the PDF will be saved.
//  * @param {string} qrUrl - The URL to be embedded in the QR code.
//  * @param {boolean} watermark - Whether to include the "VALID" watermark.
//  */
// export const generateReportPDF = async (reportData, filePath, qrUrl, watermark = false) => {
//     try {
//         const obNumber = Object.keys(reportData)[0]; 
//         const doc = new PDFDocument();
//         const stream = fs.createWriteStream(filePath);
//         doc.pipe(stream);

//         // Title Section
//         doc.fontSize(20).text('NATIONAL POLICE SERVICE', { align: 'center' });
//         // doc.moveDown();

//         // Add Logo (Centered)
//         const logoPath = path.join(__dirname, '../../logo/logo.png');
//         if (fs.existsSync(logoPath)) {
//             const imageWidth = 100;
//             const imageHeight = 100;
//             const imageX = (doc.page.width - imageWidth) / 2;
//             doc.image(logoPath, imageX, doc.y, { width: imageWidth, height: imageHeight });
//             doc.moveDown(5);
//         } else {
//             console.warn('⚠️ Logo file not found, skipping image.');
//         }

//         doc.fontSize(16).text('THE KENYA NATIONAL POLICE SERVICE', { align: 'center' });
//         doc.moveDown(2);
//         doc.fontSize(14).text('REPORT OCCURRENCE FROM POLICE RECORDS', {});
//         doc.moveDown(2);


//         // IPRS Details
//         if (reportData[obNumber][0].ip_rs_person) {
//             const { first_name, last_name, phone_number, county, sub_county, email } = (reportData[obNumber][0].ip_rs_person as IPRS_Person);
//             const leftColumnX = 50;
//             const rightColumnX = doc.page.width / 2 + 20;
//             let yPosition = doc.y;

//             doc.text(`Full Name: ${first_name} ${last_name}`, leftColumnX, yPosition, { width: 250 });
//             doc.text(`Phone: ${phone_number || 'N/A'}`, rightColumnX, yPosition, { width: 250 });
//             yPosition += 20;

//             doc.text(`County: ${county || 'N/A'}`, leftColumnX, yPosition, { width: 250 });
//             doc.text(`Sub County: ${sub_county || 'N/A'}`, rightColumnX, yPosition, { width: 250 });
//             yPosition += 20;

//             doc.text(`Email: ${email || 'N/A'}`, leftColumnX, yPosition, { width: 250 });
//             doc.moveDown();
//         } else {
//             doc.text('IPRS details not found');
//         }
//         doc.moveDown();
        

//         // Incident Details
//         doc.text('Incident Details:', { underline: true });
//         reportData[obNumber].forEach((item) => {
//             const moduleName = item.sub_module.module.name || 'Unknown Module';
//             doc.text(`Incidence Category: ${moduleName}`);
//             if (item.formData && typeof item.formData === 'object') {
//                 Object.entries(item.formData).forEach(([key, value]) => {
//                     doc.text(`${key}: ${value !== null ? value : 'N/A'}`);
//                 });
//             } else {
//                 doc.text('No details provided');
//             }
//             doc.moveDown();
//         });

//         reportData[obNumber].forEach((item) => {
          
//         });
//         doc.moveDown();  
            

//             doc.text(`OB number: ${obNumber}`,);
//             doc.text(`Date: ${reportData[obNumber][0].submissionDate ? new Date(reportData[obNumber] [0].submissionDate).toLocaleString() : 'Unknown'}`,  );
//             doc.moveDown();
//             doc.text(`Police officer: ${reportData[obNumber][0].police_officer}`,);
//             doc.text(`Police station: ${reportData[obNumber][0].police_station}`,  );
            
        
//         doc.moveDown();

//         // Generate QR Code
//         const qrImage = await QRCode.toDataURL(qrUrl);
//         const qrWidth = 100;
//         const qrX = (doc.page.width - qrWidth) / 2;
//         if (!watermark) {
//             doc.image(qrImage, qrX, doc.y, { width: qrWidth });
//         }

//         // Add Watermark if required
//         if (watermark) {
//             // Save the current graphics state
//             doc.save();

//             // Define watermark properties
//             const watermarkText = 'VALID';
//             const watermarkFontSize = 145;
//             const watermarkOpacity = 0.5;
//             const watermarkColor = 'red';

//             // Set watermark styles
//             doc.fontSize(watermarkFontSize)
//                 .fillColor(watermarkColor)
//                 .opacity(watermarkOpacity);

//             // Calculate the position for the watermark
//             const textWidth = doc.widthOfString(watermarkText);
//             const textHeight = doc.currentLineHeight();
//             const centerX = doc.page.width / 2;
//             const centerY = doc.page.height / 2;

//             // Apply rotation and position, then add the watermark text
//             doc.translate(centerX, centerY)
//                 .rotate(320)
//                 .text(watermarkText, -textWidth / 2, -textHeight / 2, {
//                     align: 'center',
//                 });

//             // Restore the graphics state to prevent affecting subsequent content
//             doc.restore();

//             // Reset fill color and opacity for further content
//             doc.fillColor('black').opacity(1);
//         }
        

//         // doc.save();
//         doc.end();
//         stream.on('finish', () => console.log(`PDF generated at ${filePath}`));
//     } catch (error) {
//         console.error('Error generating PDF:', error);
//         throw error;
//     }
// };

