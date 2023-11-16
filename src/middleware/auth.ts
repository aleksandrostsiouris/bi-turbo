import { Request, Response, NextFunction } from "express";

export const authHandler = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  if (authHeader !== `Bearer ${process.env.AUTHORIZATION_TOKEN}`) {
    res.status(401).send("You are unauthorized");
    return;
  }

  res.setHeader('Authorization', authHeader)
  next();
}