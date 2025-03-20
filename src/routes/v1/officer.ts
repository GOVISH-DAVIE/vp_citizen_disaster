import { Router } from "express"; 
import getAllOfficers from "../../services/officer";

const OfficerRouter = Router();
 
OfficerRouter.get("/", getAllOfficers); 

export default OfficerRouter;