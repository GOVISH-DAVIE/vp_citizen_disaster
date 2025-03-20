import { Router } from "express"; 
import passport from "passport";
import express, { Request, Response } from 'express';
import { searchIPRSPerson, updateIPRSPerson } from "../../services/search_iprs";


const IPRSRouter = Router();
// Module Routes  
IPRSRouter.get('/', async (req: Request, res: Response) => {
    console.log('====================================');
    console.log(req.query, "obs");
    console.log('====================================');
    try {
      const { id_no } = req.query;
      console.log('====================================');
      console.log(req.query);
      console.log('====================================');
  
      if (!id_no || typeof id_no !== 'string') {
        return res.status(400).json({ error: 'Invalid id_no parameter' });
      }
  
      const result = await searchIPRSPerson(id_no);
  
      res.json(result);
    } catch (error) {
      console.error('Error handling searchIPRSPerson request:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });


// Route to update an IPRS_Person by ID
IPRSRouter.put("/:id", async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const updatedPerson = await updateIPRSPerson(parseInt(id, 10), updateData);

    if ("error" in updatedPerson) {
      return res.status(404).json({ message: updatedPerson.error });
    }

    res.status(200).json({ message: "Person updated successfully", data: updatedPerson });
  } catch (error) {
    res.status(500).json({ message: "An error occurred while updating the record" });
  }
});

export { IPRSRouter };


