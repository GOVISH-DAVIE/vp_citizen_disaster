import { Router } from "express";
import {
    createModule,
    getAllModules,
    getModuleById,
    updateModule,
    deleteModule
} from "../../controllers/module";
import passport from "passport";

const ModuleRouter = Router();
// Module Routes
ModuleRouter.post("/",  createModule);
ModuleRouter.get("/",  getAllModules);
ModuleRouter.get("/:id",  getModuleById);
ModuleRouter.put("/:id",  updateModule);
ModuleRouter.delete("/:id",  deleteModule);

export { ModuleRouter };