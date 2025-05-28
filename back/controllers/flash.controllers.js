const Flash = require("../models/flash.model");

const getFlashs = async (req, res) => {
  try {
    const flashs = await Flash.find();
    res.status(200).json(flashs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getFlashs,
};
