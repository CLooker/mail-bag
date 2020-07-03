import path from "path";
import express, { Express, NextFunction, Request, Response } from "express";
import { serverInfo } from "express";
import * as IMAP from "./IMAP";
import * as SMTP from "./SMTP";
import * as Contacts from "./Contacts";
import { IContact } from Contacts;

const app: Express = express();

// parse JSON request body
app.use(express.json());

// serve assets for webpage
app.use("/", express.static(path.join(__dirname, "../../client/dist")));

// CORS
app.use((req: Request, res: Response, nextFn: NextFunction) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin,X-Requested-With,Contet-Type,Accept"
  );
  nextFn();
});
