import express from "express";
import { router as getArtifactsRouter } from "./artifacts";
import { router as testRouter } from "./test";
import { authHandler } from "../middleware/auth";

const routes = express.Router();

routes.use(authHandler);
routes.use("/v8/artifacts", getArtifactsRouter);
routes.use("/", testRouter);

export default routes;