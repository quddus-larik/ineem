import express from "express";
import { ParserRoute } from "./routes/parser.route.js";

const app = express();

app.use(express.json());
app.use("/api/v1/pdf", ParserRoute);


app.listen(3000);
