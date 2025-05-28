// localhost:3000/api/messageries

const { getMessageries } = require("../controllers/messagerie.controllers");

const router = require("express").Router();


router.get("/",getMessageries)

module.exports = router;