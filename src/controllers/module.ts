import { Request, Response } from "express";
import { prisma } from "../app";

// Create a new Module
export const createModule = async (req: Request, res: Response) => {
  const { name, description, bf, repetition, fields } = req.body;

  try {
    const newModule = await prisma.modules.create({
      data: {
        name,
        description,
        bf: bf || false,
        repetition: repetition || false,
        fields,
      },
    });

    res.status(201).json({
      message: "Module created successfully",
      data: newModule,
    });
  } catch (error) {
    console.error("Error creating module:", error);
    res.status(500).json({ message: "An error occurred while creating the module" });
  }
};

// Get all Modules
export const getAllModules = async (req: Request, res: Response) => {
  try {
    const modules = await prisma.modules.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        sub_modules: true,
      },
    });

    res.status(200).json({
      message: "Modules fetched successfully",
      data: modules,
    });
  } catch (error) {
    console.error("Error fetching modules:", error);
    res.status(500).json({ message: "An error occurred while fetching the modules" });
  }
};

// Get a Module by ID
export const getModuleById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const module = await prisma.modules.findUnique({
      where: { id: parseInt(id) },
      include: {
        sub_modules: true,
      },
    });

    if (!module) {
      return res.status(404).json({ message: "Module not found" });
    }

    res.status(200).json({
      message: "Module fetched successfully",
      data: module,
    });
  } catch (error) {
    console.error("Error fetching module:", error);
    res.status(500).json({ message: "An error occurred while fetching the module" });
  }
};

// Update a Module
export const updateModule = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, bf, repetition, fields } = req.body;

  try {
    const updatedModule = await prisma.modules.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description,
        bf,
        repetition,
        fields,
      },
    });

    res.status(200).json({
      message: "Module updated successfully",
      data: updatedModule,
    });
  } catch (error) {
    console.error("Error updating module:", error);
    res.status(500).json({ message: "An error occurred while updating the module" });
  }
};

// Delete a Module
export const deleteModule = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await prisma.modules.delete({
      where: { id: parseInt(id) },
    });

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting module:", error);
    res.status(500).json({ message: "An error occurred while deleting the module" });
  }
};
