import "dotenv/config";
import express from "express";
import cors from "cors";

import itemRoutes from "./routes/items";
import consumeRoutes from "./routes/consume";
import recipeRoutes from "./routes/recipe";
import todayRoutes from "./routes/today";
import visionRoutes from "./routes/vision";

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors());
app.use(express.json({ limit: "20mb" }));

app.use("/api/items", itemRoutes);
app.use("/api/consume", consumeRoutes);
app.use("/api/recipe", recipeRoutes);
app.use("/api/today", todayRoutes);
app.use("/api/vision", visionRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
