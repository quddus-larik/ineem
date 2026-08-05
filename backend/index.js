import express from "express";
import { PdfRoute } from "./routes/upload.route.js";
import { policyRoute } from "./routes/policies.route.js";

const app = express();

app.use(express.json())
app.use("/api/v1/pdf", PdfRoute);
app.use("/api/v1/", policyRoute);

app.listen(3000);