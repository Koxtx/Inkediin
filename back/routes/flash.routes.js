// localhost:3000/api/flashs

const { getFlashs } = require("../controllers/flash.controllers");

const router = require("express").Router();


router.get("/",getFlashs)

module.exports = router;