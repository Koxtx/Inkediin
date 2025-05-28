const Messagerie = require("../models/messagerie.model");

const getMessageries = async (req, res) => {
  try {
    const messageries = await Messagerie.find();
    res.status(200).json(messageries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getMessageries,
};
