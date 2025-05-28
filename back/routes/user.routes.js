// localhost:3000/api/users

const { getUsers } = require("../controllers/user.controllers");

const router = require("express").Router();


router.get("/",getUsers)

module.exports = router;
