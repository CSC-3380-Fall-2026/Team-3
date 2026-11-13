import express from "express";
import testRoutes from "./routes/test";
import gameRoutes from "./routes/games";
import liveGameRoutes from "./routes/liveGames";
import livePlayerStatsRoutes from "./routes/livePlayerStats";
import demoReplayRoutes from "./routes/demoReplay";

const app = express();

app.use(express.json());

app.use("/api", testRoutes);
app.use("/api", gameRoutes);

app.use("/api", liveGameRoutes);
app.use("/api", livePlayerStatsRoutes);

app.use("/api", demoReplayRoutes);

export default app;
