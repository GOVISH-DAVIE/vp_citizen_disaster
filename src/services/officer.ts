import { Request, Response } from "express";
const getAllOfficers = async (req: Request, res: Response) => {
    //fetch all officers from the auth microservice
    const response = await fetch(`http://${process.env.AUTH_HOST}:${process.env.AUTH_PORT}/api/v1/officer`);
    const data = await response.json();
    console.log(data);
    return res.status(200).json(data);
};

export default getAllOfficers;
