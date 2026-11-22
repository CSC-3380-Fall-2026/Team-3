import express from "express";
import testRoutes from "./routes/test";
import gameRoutes from "./routes/games";
import liveGameRoutes from "./routes/liveGames";
import livePlayerStatsRoutes from "./routes/livePlayerStats";
import healthRoutes from "./routes/health";
import historicalSituationsRoutes from "./routes/historicalSituations";
import playerPropsRoutes from "./routes/playerProps";
import demoReplayRoutes from "./routes/demoReplay";
import chatbotRoutes from "./routes/chatbot";

const app = express();

app.use(express.json());

app.use("/api", testRoutes);
app.use("/api", gameRoutes);
app.use("/api", chatbotRoutes);

app.use("/api", liveGameRoutes);
app.use("/api", livePlayerStatsRoutes);
app.use("/api", historicalSituationsRoutes);
app.use("/api", playerPropsRoutes);

app.use("/api", healthRoutes);

app.use("/api", demoReplayRoutes);

export default app;
