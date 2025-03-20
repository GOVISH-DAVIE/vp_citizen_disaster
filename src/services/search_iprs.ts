import { Request, Response } from "express";
import { prisma } from "../app";
import axios from 'axios';
import { IPRS_Person } from "@prisma/client";

interface MulterRequest extends Request {
    files: any[];
}

export async function searchIPRSPerson(id_no: string) {
  try {
    // Query the Prisma database
    const existingPerson = await prisma.iPRS_Person.findUnique({
      where: {
        id_no,
      }, 
    });

    // If the person exists in the Prisma database, return the data
    if (existingPerson) {
      return existingPerson;
    }

    // If the person does not exist in the Prisma database, make a request to the Django application
    const token = 'bfe589e3b29f68e0c3dd506d3a2c6f3996813fbf';
    const response = await axios.get(`https://internal-portal.virtualpolicestation.com/vps/api/v0/iprs-persons?id_no=${id_no}&country_isoCode=KE`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    // Extract data from the response
    const vps = response.data;
    console.log('====================================');
    console.log(vps.results[0]);
    console.log('====================================');

    // Store the retrieved data in the Prisma database
    const createdPerson = await prisma.iPRS_Person.create({
      data: {
        id_no: vps.results[0].id_no,
        passport_no: vps.results[0].passport_no,
        first_name: vps.results[0].first_name,
        middle_name: vps.results[0].middle_name,
        last_name: vps.results[0].last_name,
        gender: vps.results[0].gender.name,
        nationality: vps.results[0].nationality.name,
        county_of_birth: vps.results[0].county_of_birth,
        district_of_birth: vps.results[0].district_of_birth,
        division_of_birth: vps.results[0].division_of_birth,
        location_of_birth: vps.results[0].location_of_birth,
        date_of_birth: new Date(vps.results[0].date_of_birth),
        mug_shot: vps.results[0].mug_shot,
      },
    });

    // Return the retrieved data to the client
    return createdPerson;
  } catch (error) {
    console.error('Error fetching data from vps:', error);
    throw new Error('Internal Server Error');
  }
}


export async function updateIPRSPerson(id: number, updateData: Partial<IPRS_Person>) {
  try {
    // Check if the person exists
    const existingPerson = await prisma.iPRS_Person.findUnique({
      where: { id },
    });

    if (!existingPerson) {
      return { error: "Person not found in the database" };
    }

    // Update the record
    const updatedPerson = await prisma.iPRS_Person.update({
      where: { id },
      data: updateData,
    });

    return updatedPerson;
  } catch (error) {
    console.error("Error updating IPRS_Person:", error);
    throw new Error("Internal Server Error");
  }
}

