import { Request, Response } from "express";
import nodemailer from "nodemailer"; // For sending emails
import path from "path";
import { generateReportPDF } from "../utils/generatePdf"; // Import the PDF generation function
import { prisma } from "../app";
import { sendReportEmail } from '../utils/sendEmail';
import fs from 'fs';
import { Action, ForwardedTo } from "@prisma/client";
import axios from "axios";
declare global {
  namespace Express {
    interface User {
      id: string;
    }
  }
}


export const createSubModuleData = async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    const { iprsId } = req.body;

    // Parse the formData JSON string
    let formDataObj;
    try {
      formDataObj = JSON.parse(req.body.formData);
    } catch (error) {
      return res.status(400).json({ message: "Invalid formData format" });
    }

    // Validate and extract action and forwarded_to
    const action = formDataObj.action as Action;
    const forwardedTo = formDataObj.forwarded_to as ForwardedTo;

    if (action && !Object.values(Action).includes(action)) {
      return res.status(400).json({ message: 'Invalid action value' });
    }

    if (forwardedTo && !Object.values(ForwardedTo).includes(forwardedTo)) {
      return res.status(400).json({ message: 'Invalid forwarded_to value' });
    }

    const filePaths = files.map((file) => `uploads/${file.filename}`);

    // Fetch user email from iprs table
    const iprsRecord = await prisma.iPRS_Person.findUnique({
      where: { id: parseInt(iprsId, 10) },
      select: { email: true },
    });

    if (!iprsRecord?.email) {
      return res.status(404).json({ message: "Email not found for the given IPRS ID" });
    }

    // Generate OB Number
    const lastEntry = await prisma.sub_module_data.findFirst({
      orderBy: { id: 'desc' },
      select: { id: true }
    });
    const lastId = lastEntry ? lastEntry.id : 0;
    const now = new Date();
    const obNumber = `${lastId + 1}/${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()}`;

    // Create entries for each form submission
    const createdEntries = await Promise.all(
      Object.entries(formDataObj).map(async ([key, value]) => {
        const subModule = await prisma.sub_module.findFirst({
          where: { name: key },
          select: { id: true }
        });

        if (!subModule) {
          throw new Error(`Sub module not found for name: ${key}`);
        }

        return prisma.sub_module_data.create({
          data: {
            sub_moduleId: subModule.id,
            userId: parseInt(req.user?.id, 10),
            formData: value as any,
            attachments: filePaths,
            ob_number: obNumber,
            iprsId: parseInt(iprsId, 10), 
            forwarded_to: forwardedTo || null,
          },
          include: {
            ip_rs_person: true,
            sub_module: {
              include: {
                module: true,
              },
            },
          },
        });
      })
    );

    // Forward the OB to the external microservice
    // const externalServiceUrl = process.env.EXTERNAL_SERVICE_URL + "/api/v1/ob-action";
    // await axios.post(externalServiceUrl, {
    //   ob_number: obNumber,
    //   action,
    //   forwarded_to: forwardedTo,
    //   iprsId,
    //   createdEntries,
    // });

    
    const reportData = createdEntries.reduce((acc, item) => { 
      acc[item.ob_number] = acc[item.ob_number] || [];
      acc[item.ob_number].push(item);
      return acc;
    }, {});
    console.log(reportData, "reportData");
    const reportDir = path.join(__dirname, "../../../reports");
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
      
    }
    const reportFilePath = path.join(reportDir, `report_${obNumber.replace(/\//g, '-')}.pdf`);
    const qrCodeFilePath = path.join(reportDir, `https://ob-main.virtualpolicestation.com/reports/${obNumber}`);
    await generateReportPDF(reportData, reportFilePath, qrCodeFilePath, true);

    // Setup Nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: true, // Use TLS
      auth: {
        user: process.env.SMTP_USER,
        pass: "Vps@2023#",
      },
    });

    // Email options
    const mailOptions = {
      from: '"Virtual Police Station" <noreply@virtualpolicestation.com>',
      to: iprsRecord.email,
      subject: 'Your Report PDF',
      text: 'Please find attached your report PDF.',
      attachments: [
        {
          filename: `report_${obNumber.replace(/\//g, '-')}.pdf`,
          path: reportFilePath,
          contentType: 'application/pdf',
        },
      ],
    };

    // Send the email
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${iprsRecord.email}`);

    console.log(reportData, "success");
    res.status(201).json({
      message: "Sub Module Data created successfully",
      data: reportData,
    });

    

  } catch (error) {
    console.error("Error creating SubModuleData:", error);
    res.status(500).json({
      message: "An error occurred while creating the SubModuleData",
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};




// Get user applications
export const getUserApplications = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(403).json({ message: "Unauthorized access." });
    }

    const userApplications = await prisma.sub_module_data.findMany({
      where: {
        userId: parseInt(userId),
      },
      // select: {
      //   id: true,
      //   sub_moduleId: true,
      //   formData: true,
      //   attachments: true,
      //   submissionDate: true,
      //   iprsId: true,
      // },
    });

    res.status(200).json({
      message: "User applications fetched successfully.",
      data: userApplications,
    });
  } catch (error) {
    console.error("Error fetching user applications:", error);
    res.status(500).json({ message: "An error occurred while fetching applications." });
  }
};

// Get all SubModuleData
export const getAllSubModuleData = async (req: Request, res: Response) => {
  try {
    const subModuleData = await prisma.sub_module_data.findMany({
      orderBy: { submissionDate: "desc" },
      include: {
        sub_module: {
          include: {
            module: true,
          },
        },
        ip_rs_person: true,
      },
      // select: {
      //   id: true,
      //   sub_moduleId: true,
      //   formData: true,
      //   attachments: true,
      //   submissionDate: true,
      //   iprsId: true,
      //   sub_module: {
      //     select: {
      //       name: true,
      //     },
      //   },
      // },
    });
    // group by obnumber
    const groupedData = subModuleData.reduce((acc, item) => { 
      acc[item.ob_number] = acc[item.ob_number] || [];
      acc[item.ob_number].push(item);
      return acc;
    }, {});

    res.status(200).json({
      message: "SubModuleData fetched successfully",
      data: groupedData,
    });
  } catch (error) {
    console.error("Error fetching SubModuleData:", error);
    res.status(500).json({ message: "An error occurred while fetching the SubModuleData" });
  }
};

// Get SubModuleData by ID
export const getSubModuleDataById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const subModuleData = await prisma.sub_module_data.findUnique({
      where: { id: parseInt(id) },
      include: {
        sub_module: true,
      },
    });

    if (!subModuleData) {
      return res.status(404).json({ message: "SubModuleData not found" });
    }

    res.status(200).json({
      message: "SubModuleData fetched successfully",
      data: subModuleData,
    });
  } catch (error) {
    console.error("Error fetching SubModuleData:", error);
    res.status(500).json({ message: "An error occurred while fetching the SubModuleData" });
  }
};

// Update SubModuleData
export const updateSubModuleData = async (req: Request, res: Response) => {
  const { ob_number } = req.params;
  const payload = req.body;
  console.log('====================================');
  console.log(payload, "payload");
  console.log('====================================');


  try { 
   
      const updatedSubModuleData = await prisma.sub_module_data.updateMany({
        where: {  ob_number: ob_number.replace("-" , "/").toString() },
      data: payload,
    });
    if(payload.assigned_officer_id){
      console.log('====================================');
      console.log(payload.assigned_officer_id, "payload.assigned_officer_id");
      console.log('====================================');
      sendToExternalService(`http://${process.env.STAFF_HOST_URL}/api/v1/duties`, {
        ob_number: ob_number.replace("-" , "/").toString(),
        action: payload.action,
        assigned_officer_id: payload.assigned_officer_id,
      });

    }

    res.status(200).json({
      message: "SubModuleData updated successfully",
      data: updatedSubModuleData,
    });
    // console.log(updatedSubModuleData, "updatedSubModuleData");
  } catch (error) {
    console.error("Error updating SubModuleData:", error);
    res.status(500).json({ message: "An error occurred while updating the SubModuleData" });
  }
};


// Endpoint to receive updated OB records
export const receiveUpdatedOb = async (req: Request, res: Response): Promise<void> => {
  const { ob_number, action, forwarded_to, ...rest } = req.body;

  try {
    // Validate action
    if (action && !Object.values(Action).includes(action)) {
      res.status(400).json({ message: 'Invalid action value' });
      return;
    }

    // Validate forwarded_to
    if (forwarded_to && !Object.values(ForwardedTo).includes(forwarded_to)) {
      res.status(400).json({ message: 'Invalid forwarded_to value' });
      return;
    }

    // Find the existing OB record by ob_number
    const existingOb = await prisma.sub_module_data.findFirst({
      where: { ob_number },
    });

    if (!existingOb) {
      res.status(404).json({ message: 'OB record not found' });
      return;
    }

    // Update the OB record with new values
    const updatedOb = await prisma.sub_module_data.update({
      where: { id: existingOb.id },
      data: { 
        forwarded_to: forwarded_to || existingOb.forwarded_to,
        formData: {
          ...(existingOb.formData as Record<string, any>),
          ...rest,
        },
      },
    });

    res.status(200).json({
      message: 'OB record updated successfully',
      data: updatedOb,
    });
  } catch (error) {
    console.error('Error updating OB record:', error);
    res.status(500).json({
      message: 'An error occurred while updating the OB record',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Delete SubModuleData
export const deleteSubModuleData = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await prisma.sub_module_data.delete({
      where: { id: parseInt(id) },
    });

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting SubModuleData:", error);
    res.status(500).json({ message: "An error occurred while deleting the SubModuleData" });
  }
};




export const sendToExternalService = async (url: string, data: any) => {
  try {
    const response = await axios.post(url, data);
    console.log(`Data sent to ${url}:`, response.data);

    // ✅ If this is a RETURN to the origin service, log it
    if (url.includes('/api/v1/ob/update')) {
      console.log(`OB successfully sent back to origin service: ${data.ob_number}`);
    }
  } catch (error) {
    console.error(`Error sending data to ${url}:`, error);
  }
};