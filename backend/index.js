import express from "express";
import { PdfRoute } from "./routes/upload.route.js";

const app = express();

app.use(express.json())
app.use("/pdf", PdfRoute);

app.listen(3000);