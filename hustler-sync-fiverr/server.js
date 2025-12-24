require("dotenv").config();

const express = require("express");

const cors = require("cors");
const rateLimiter = require("express-rate-limit");
const helmet = require("helmet");
const trimRequest = require("trim-request");

const connectDB = require("./config/db");
const { errorHandler, notFound } = require("./middleware/errorMiddleware");

const commonRoutes = require("./routes/commonRoutes");
// const clientRoutes = require("./routes/clientRoutes");
// const hustlerRoutes = require("./routes/hustlerRoutes");

connectDB();

const app = express();

app.set("trust proxy", 1);
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: "draft-7", // draft-6: RateLimit-* headers; draft-7: combined RateLimit header
    legacyHeaders: false, // X-RateLimit-* headers
  })
);

app.use(helmet());
app.use(cors());
app.use(trimRequest.all);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (_, res) => {
  res.json({
    success: true,
    message: "HustlerSync API is running",
    version: "1.0.0",
    endpoints: {
      common: "/api",
      client: "/api/client",
      hustler: "/api/hustler",
    },
  });
});

app.use("/api", commonRoutes);
// app.use("/api/client", clientRoutes);
// app.use("/api/hustler", hustlerRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5050;

app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});
module.exports = app;