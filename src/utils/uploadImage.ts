// src/utils/uploadImage.ts
import fs from 'fs';
import path from 'path';

export const uploadImage = (file: Express.Multer.File): string => {
    const filePath = path.join('uploads', file.filename);
    
    return filePath; // Return a single string
};


// for single upload
// import fs from 'fs';
// import path from 'path';

// export const uploadImage = (file: Express.Multer.File): string => {
//     // Assuming the file is already stored by Multer in 'uploads/' directory
//     const filePath = path.join('uploads', file.filename);
    
//     // You can add additional logic here if needed, such as resizing or processing the image

//     return filePath; // Return the file path to be stored in the database
// };
