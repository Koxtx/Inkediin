const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const path = require("path");
const __DIRNAME = path.resolve();

const app = express();

app.use(express.static(path.join(__DIRNAME, "/front/dist")));
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

app.use(express.json());

const postRoutes = require("./routes/post.routes");

app.use("/post", postRoutes);
app.get(/(.*)/, (req, res) => {
  res.sendFile(path.join(__DIRNAME, "front", "dist", "index.html"));
});

mongoose.connect(process.env.MONGO_URL).then(() => {
  console.log("✅ MongoDB connected");
  app.listen(process.env.PORT, () =>
    console.log("🚀 Server on http://localhost:3000")
  );
});
