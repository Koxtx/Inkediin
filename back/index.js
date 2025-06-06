const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const path = require("path");
const cookieParser = require("cookie-parser");
const {serverHttp,app}=require("./socket/socket")


const __DIRNAME = path.resolve();



app.use(express.static(path.join(__DIRNAME, "/front/dist")));
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));

app.use(express.json());
app.use(cookieParser());

const feedRoutes = require("./routes/feed.routes");
const flashRoutes = require("./routes/flash.routes");
const messagerieRoutes = require("./routes/messagerie.routes");
const notificationRoutes = require("./routes/notification.routes");
const reservationRoutes = require("./routes/reservation.routes");
const userRoutes = require("./routes/user.routes");

app.use("/api/feeds", feedRoutes);
app.use("/api/flashs", flashRoutes);
app.use("/api/messageries", messagerieRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/users", userRoutes);

app.get(/(.*)/, (req, res) => {
  res.sendFile(path.join(__DIRNAME, "front", "dist", "index.html"));
});

mongoose.connect(process.env.MONGO_URL).then(() => {
  console.log("✅ MongoDB connected");
  app.listen(process.env.PORT, () =>
    console.log("🚀 Server on http://localhost:3000")
  );
});
