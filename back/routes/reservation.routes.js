// localhost:3000/api/reservation

const { getReservations } = require("../controllers/reservation.controllers");

const router = require("express").Router();


router.get("/",getReservations)

module.exports = router;