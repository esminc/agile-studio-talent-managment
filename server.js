import { createRequestHandler } from "@react-router/express";
import express from "express";
import compression from "compression";
import morgan from "morgan";

import * as build from "./build/server/index.js";

const app = express();
app.disable("x-powered-by");
app.use(compression());
app.use(express.static("build/client"));
app.use(morgan("tiny"));

app.all("*", createRequestHandler({ build }));

app.listen(3000, () => {
  console.log("App listening on http://localhost:3000");
});
