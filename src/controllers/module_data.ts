import { Request, Response } from "express";
import { prisma } from "../app";

// Create a new ModuleData
export const createModuleData = async (req: Request, res: Response) => {
  const { moduleId, userId } = req.body;
  const files = req.files as Express.Multer.File[]; // Access uploaded files

  try {
    const formData = JSON.parse(req.body.formData); // Parse formData as JSON
    const filePaths = files.map((file) => `uploads/${file.filename}`); // Get file paths

    const newModuleData = await prisma.moduleData.create({
      data: {
        moduleId: parseInt(moduleId, 10), // Ensure moduleId is an integer
        userId: parseInt(userId, 10), // Ensure userId is an integer
        formData, // Store the parsed JSON object
        attachments: filePaths, // Store file paths
      },
    });

    res.status(201).json({
      message: "ModuleData created successfully",
      data: newModuleData,
    });
  } catch (error) {
    console.error("Error creating ModuleData:", error);
    res.status(500).json({ message: "An error occurred while creating the ModuleData" });
  }
};

// Get all ModuleData
export const getAllModuleData = async (req: Request, res: Response) => {
  try {
    const moduleData = await prisma.moduleData.findMany({
      orderBy: { submissionDate: "desc" },
      include: {
        Modules: true,
      },
    });

    res.status(200).json({
      message: "ModuleData fetched successfully",
      data: moduleData,
    });
  } catch (error) {
    console.error("Error fetching ModuleData:", error);
    res.status(500).json({ message: "An error occurred while fetching the ModuleData" });
  }
};

// Get ModuleData by ID
export const getModuleDataById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const moduleData = await prisma.moduleData.findUnique({
      where: { id: parseInt(id) },
      include: {
        Modules: true,
      },
    });

    if (!moduleData) {
      return res.status(404).json({ message: "ModuleData not found" });
    }

    res.status(200).json({
      message: "ModuleData fetched successfully",
      data: moduleData,
    });
  } catch (error) {
    console.error("Error fetching ModuleData:", error);
    res.status(500).json({ message: "An error occurred while fetching the ModuleData" });
  }
};

// Update ModuleData
export const updateModuleData = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { moduleId, userId } = req.body;
  const files = req.files as Express.Multer.File[]; // Access uploaded files

  try {
    const formData = JSON.parse(req.body.formData); // Parse formData as JSON
    const filePaths = files.map((file) => `uploads/${file.filename}`); // Get file paths

    const updatedModuleData = await prisma.moduleData.update({
      where: { id: parseInt(id) },
      data: {
        moduleId: parseInt(moduleId, 10),
        userId: parseInt(userId, 10),
        formData, // Store the parsed JSON object
        attachments: filePaths, // Update file paths
      },
    });

    res.status(200).json({
      message: "ModuleData updated successfully",
      data: updatedModuleData,
    });
  } catch (error) {
    console.error("Error updating ModuleData:", error);
    res.status(500).json({ message: "An error occurred while updating the ModuleData" });
  }
};

// Delete ModuleData
export const deleteModuleData = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await prisma.moduleData.delete({
      where: { id: parseInt(id) },
    });

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting ModuleData:", error);
    res.status(500).json({ message: "An error occurred while deleting the ModuleData" });
  }
};
