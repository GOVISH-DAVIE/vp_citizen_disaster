import { Request, Response } from "express";
import { prisma } from "../app";

// Create a new Sub-Module
export const createSubModule = async (req: Request, res: Response) => {
  const { name, description, bf, repetition, fields, modulesId } = req.body;

  try {
    const newSubModule = await prisma.sub_module.create({
      data: {
        name,
        description,
        bf: bf || false,
        repetition: repetition || false,
        fields,
        modulesId,
      },
    });

    res.status(201).json({
      message: "Sub-module created successfully",
      data: newSubModule,
    });
  } catch (error) {
    console.error("Error creating sub-module:", error);
    res.status(500).json({ message: "An error occurred while creating the sub-module" });
  }
};

// Get all Sub-Modules
export const getAllSubModules = async (req: Request, res: Response) => {
  try {
    const subModules = await prisma.sub_module.findMany({
      include: {
        module: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      message: "Sub-modules fetched successfully",
      data: subModules,
    });
  } catch (error) {
    console.error("Error fetching sub-modules:", error);
    res.status(500).json({ message: "An error occurred while fetching the sub-modules" });
  }
};

// Get a Sub-Module by ID
export const getSubModuleById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const subModule = await prisma.sub_module.findUnique({
      where: { id: parseInt(id) },
      include: {
        module: true,
      },
    });

    if (!subModule) {
      return res.status(404).json({ message: "Sub-module not found" });
    }

    res.status(200).json({
      message: "Sub-module fetched successfully",
      data: subModule,
    });
  } catch (error) {
    console.error("Error fetching sub-module:", error);
    res.status(500).json({ message: "An error occurred while fetching the sub-module" });
  }
};

// Update a Sub-Module
export const updateSubModule = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, bf, repetition, fields, modulesId } = req.body;

  try {
    const updatedSubModule = await prisma.sub_module.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description,
        bf,
        repetition,
        fields,
        modulesId,
      },
    });

    res.status(200).json({
      message: "Sub-module updated successfully",
      data: updatedSubModule,
    });
  } catch (error) {
    console.error("Error updating sub-module:", error);
    res.status(500).json({ message: "An error occurred while updating the sub-module" });
  }
};

// Delete a Sub-Module
export const deleteSubModule = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await prisma.sub_module.delete({
      where: { id: parseInt(id) },
    });

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting sub-module:", error);
    res.status(500).json({ message: "An error occurred while deleting the sub-module" });
  }
};
