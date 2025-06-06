const Flash = require("../models/flash.model");
const mongoose = require('mongoose');

// Récupérer tous les flashs avec filtres
const getFlashs = async (req, res) => {
  try {
    const { 
      disponible, 
      tatoueur, 
      prixMin, 
      prixMax, 
      page = 1, 
      limit = 10 
    } = req.query;

    // Construction du filtre
    const filter = {};
    if (disponible !== undefined) filter.disponible = disponible === 'true';
    if (tatoueur) filter.idTatoueur = tatoueur;
    if (prixMin || prixMax) {
      filter.prix = {};
      if (prixMin) filter.prix.$gte = parseFloat(prixMin);
      if (prixMax) filter.prix.$lte = parseFloat(prixMax);
    }

    const flashs = await Flash.find(filter)
      .populate('idTatoueur', 'nom prenom avatar')
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Flash.countDocuments(filter);

    res.status(200).json({
      flashs,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Récupérer un flash par ID
const getFlashById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID invalide" });
    }

    const flash = await Flash.findById(id).populate('idTatoueur', 'nom prenom avatar email');
    
    if (!flash) {
      return res.status(404).json({ error: "Flash non trouvé" });
    }

    res.status(200).json(flash);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Créer un nouveau flash
const createFlash = async (req, res) => {
  try {
    const { prix, description } = req.body;
    const idTatoueur = req.user._id; // Récupéré du middleware d'authentification

    if (!req.file) {
      return res.status(400).json({ error: "Image requise" });
    }

    if (!prix || isNaN(prix) || prix < 0) {
      return res.status(400).json({ error: "Prix invalide" });
    }

    const newFlash = new Flash({
      idTatoueur,
      image: `/uploads/flashs/${req.file.filename}`,
      prix: parseFloat(prix),
      description: description || '',
      disponible: true,
      reserve: false
    });

    const savedFlash = await newFlash.save();
    const populatedFlash = await Flash.findById(savedFlash._id)
      .populate('idTatoueur', 'nom prenom avatar');

    res.status(201).json(populatedFlash);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mettre à jour un flash
const updateFlash = async (req, res) => {
  try {
    const { id } = req.params;
    const { prix, description, disponible } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID invalide" });
    }

    const flash = await Flash.findById(id);
    if (!flash) {
      return res.status(404).json({ error: "Flash non trouvé" });
    }

    // Vérifier que l'utilisateur est le propriétaire
    if (flash.idTatoueur.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Accès interdit" });
    }

    const updateData = {};
    if (prix !== undefined) {
      if (isNaN(prix) || prix < 0) {
        return res.status(400).json({ error: "Prix invalide" });
      }
      updateData.prix = parseFloat(prix);
    }
    if (description !== undefined) updateData.description = description;
    if (disponible !== undefined) updateData.disponible = disponible;

    const updatedFlash = await Flash.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true }
    ).populate('idTatoueur', 'nom prenom avatar');

    res.status(200).json(updatedFlash);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Supprimer un flash
const deleteFlash = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID invalide" });
    }

    const flash = await Flash.findById(id);
    if (!flash) {
      return res.status(404).json({ error: "Flash non trouvé" });
    }

    // Vérifier que l'utilisateur est le propriétaire
    if (flash.idTatoueur.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Accès interdit" });
    }

    await Flash.findByIdAndDelete(id);
    res.status(200).json({ message: "Flash supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Récupérer les flashs d'un tatoueur
const getFlashsByTatoueur = async (req, res) => {
  try {
    const { tatoueurId } = req.params;
    const { disponible, page = 1, limit = 10 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(tatoueurId)) {
      return res.status(400).json({ error: "ID tatoueur invalide" });
    }

    const filter = { idTatoueur: tatoueurId };
    if (disponible !== undefined) filter.disponible = disponible === 'true';

    const flashs = await Flash.find(filter)
      .populate('idTatoueur', 'nom prenom avatar')
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Flash.countDocuments(filter);

    res.status(200).json({
      flashs,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Basculer le statut de réservation
const toggleReserve = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID invalide" });
    }

    const flash = await Flash.findById(id);
    if (!flash) {
      return res.status(404).json({ error: "Flash non trouvé" });
    }

    // Seul le propriétaire peut modifier le statut
    if (flash.idTatoueur.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Accès interdit" });
    }

    flash.reserve = !flash.reserve;
    await flash.save();

    const updatedFlash = await Flash.findById(id)
      .populate('idTatoueur', 'nom prenom avatar');

    res.status(200).json(updatedFlash);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getFlashs,
  getFlashById,
  createFlash,
  updateFlash,
  deleteFlash,
  getFlashsByTatoueur,
  toggleReserve
};