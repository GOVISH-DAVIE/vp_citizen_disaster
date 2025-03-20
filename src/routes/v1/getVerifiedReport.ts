import express from "express";
import { getVerifiedReport } from "../../controllers/getVerifiedReport";

const VerifiedReportRouter = express.Router();

VerifiedReportRouter.get("/reports/:ob_number/verified", getVerifiedReport);



export { VerifiedReportRouter };


