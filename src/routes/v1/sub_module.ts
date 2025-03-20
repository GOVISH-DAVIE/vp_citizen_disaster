import { Router } from "express";
import {
    createSubModule,
    getAllSubModules,
    getSubModuleById,
    updateSubModule,
    deleteSubModule
} from "../../controllers/sub_module";
import { upload } from "../../middleware/multer";
// import passport from "passport";
const SubModulesRouter = Router();

SubModulesRouter.post("/", upload.any(), createSubModule);
SubModulesRouter.get("/",  getAllSubModules);    
SubModulesRouter.get("/:id",   getSubModuleById);
SubModulesRouter.put("/:id",  updateSubModule);
SubModulesRouter.delete("/:id",  deleteSubModule);

export { SubModulesRouter };
