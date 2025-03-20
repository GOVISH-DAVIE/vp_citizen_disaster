import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
var multer = require('multer');
export var forms = multer({
  dest: 'upload/',
});
import {PrismaClient } from '@prisma/client';
import fs from 'fs';

const passport = require('passport')
require('./middleware/passport')
export const prisma = new PrismaClient()

export const saltRounds = 10;

const bcrypt = require('bcrypt');


const session = require('express-session')
const LocalStrategy = require('passport-local').Strategy
const http = require('http');
const app = express();

const { Server } = require("socket.io");
import { uuid } from 'uuidv4';
import cors from 'cors';
import { home } from './routes/home';
import path from 'path';


import { ModuleRouter } from './routes/v1/module';
import { ModuleDataRouter } from './routes/v1/module_data';
import { SubModulesRouter } from './routes/v1/sub_module';
import { SubModuleDataRouter } from './routes/v1/sub_module_data';
import { VerifiedReportRouter } from './routes/v1/getVerifiedReport';

import { Request, Response } from 'express';
import { IPRSRouter } from './routes/v1/iprs';
import OfficerRouter from './routes/v1/officer';

app.use(bodyParser.json({ limit: '50mb', type: 'application/json' }));
app.use(session({
  secret: "secret",
  resave: false,
  saveUninitialized: true,
}));




// app.use(cors({credentials: true, origin: '*'}))
const whitelist = ['http://localhost:4001', 'http://localhost', '*'];
// init()30

app.options('*', cors())




export const server = http.createServer(app);

const corsOptions = {
  credentials: true,
  origin: (origin, callback) => {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
};

app.use(cors({
  origin: '*'
}));
// io.use

dotenv.config();
// init()
export const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});



// Serve static files from "public" directory
app.use(express.static("public"));

// routes
app.use('/', home);
app.use('/api/v1/iprs', IPRSRouter);
app.use('/api/v1/module', ModuleRouter);
app.use('/api/v1/sub_module', SubModulesRouter);
app.use('/api/v1/sub_module_data',  SubModuleDataRouter);
app.use('/api/v1/module_data', ModuleDataRouter);
app.use('/api/v1/getVerifiedReport', VerifiedReportRouter);
app.use('/api/v1/officers', OfficerRouter);

//  uploads
app.get('/uploads/:filename', (req, res) => {
  const filename = req.params.filename;
  res.sendFile(filename, { root: path.join('uploads') }); // serve files from uploads directory
});

//  report
app.get('/reports/:filename', (req: Request, res: Response) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'reports', filename);

  // Check if file exists
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ message: "File not found" });
  }
});


export const JWTSecret = "secret"
// app.use('/product', product)

// start the server
app.listen(process.env.BACK_PORT, () => {
  console.log(
    `server running : http://localhost:${process.env.BACK_PORT}`
  );
});

server.listen(process.env.SOCKET_PORT, () => {
  console.log(`socket listening  on *:${process.env.SOCKET_PORT}`);
}); 
