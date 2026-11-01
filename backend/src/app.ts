import express from "express";
import testRoutes from "./routes/test";
import gameRoutes from "./routes/games";

const app = express();

app.use(express.json());

app.use("/api", testRoutes);
app.use("/api", gameRoutes);

export default app;
