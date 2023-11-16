import express, { Request, Response, Application } from 'express';
import cors from "cors";
import dotenv from 'dotenv';
import routes from './routes';
dotenv.config();

const app: Application = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.raw({ type: "application/octet-stream", limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(routes);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
