import { Router } from "express";
import {
    createModuleData,
    getAllModuleData,
    getModuleDataById,
    updateModuleData,
    deleteModuleData
} from "../../controllers/module_data";
// import passport from "passport";
const ModuleDataRouter = Router();

ModuleDataRouter.post("/",  createModuleData);
ModuleDataRouter.get("/",  getAllModuleData);
ModuleDataRouter.get("/:id",  getModuleDataById);
ModuleDataRouter.put("/:id",  updateModuleData);
ModuleDataRouter.delete("/:id",  deleteModuleData);

export { ModuleDataRouter };
