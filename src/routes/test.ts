import express, { Router, Request, Response } from "express";

export const router: Router = express.Router();

router.get("/ping", (_: Request, res: Response) => res.status(200).send("Pong"))