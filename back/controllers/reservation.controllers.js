const Reservation = require("../models/reservation.model");
const Flash = require("../models/flash.model");
const mongoose = require('mongoose');

// Créer une nouvelle réservation
const createReservation = async (req, res) => {
  try {
    const { idFlash, messageClient } = req.body;
    const idClient = req.user._id;

    // Validation des données
    if (!idFlash || !messageClient) {
      return res.status(400).json({ 
        error: "Flash ID et message client requis" 
      });
    }

    if (!mongoose.Types.ObjectId.isValid(idFlash)) {
      return res.status(400).json({ error: "ID Flash invalide" });
    }

    if (messageClient.trim().length < 10) {
      return res.status(400).json({ 
        error: "Le message doit contenir au moins 10 caractères" 
      });
    }

    // Vérifier que le flash existe et est disponible
    const flash = await Flash.findById(idFlash).populate('idTatoueur');
    if (!flash) {
      return res.status(404).json({ error: "Flash non trouvé" });
    }

    if (!flash.disponible) {
      return res.status(400).json({ error: "Flash non disponible" });
    }

    if (flash.reserve) {
      return res.status(400).json({ error: "Flash déjà réservé" });
    }

    // Vérifier qu'il n'y a pas déjà une réservation en cours pour ce flash
    const existingReservation = await Reservation.findOne({
      idFlash: idFlash,
      statut: { $in: ['en_attente', 'confirmee'] }
    });

    if (existingReservation) {
      return res.status(400).json({ 
        error: "Une réservation est déjà en cours pour ce flash" 
      });
    }

    // Vérifier que le client ne réserve pas son propre flash
    if (flash.idTatoueur._id.toString() === idClient.toString()) {
      return res.status(400).json({ 
        error: "Vous ne pouvez pas réserver votre propre flash" 
      });
    }

    // Créer la réservation
    const newReservation = new Reservation({
      idClient,
      idFlash,
      idTatoueur: flash.idTatoueur._id,
      messageClient: messageClient.trim(),
      statut: 'en_attente'
    });

    // Sauvegarder la réservation et marquer le flash comme réservé
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const savedReservation = await newReservation.save({ session });
      
      // Marquer le flash comme réservé
      await Flash.findByIdAndUpdate(
        idFlash,
        { reserve: true },
        { session }
      );

      await session.commitTransaction();

      // Récupérer la réservation complète avec les données populées
      const populatedReservation = await Reservation.findById(savedReservation._id)
        .populate('idClient', 'nom prenom email')
        .populate('idFlash', 'image prix description')
        .populate('idTatoueur', 'nom prenom email');

      res.status(201).json(populatedReservation);

    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Répondre à une réservation (tatoueur)
const respondToReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const { statut, messageTatoueur } = req.body;
    const idTatoueur = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID réservation invalide" });
    }

    if (!['confirmee', 'annulee_tatoueur'].includes(statut)) {
      return res.status(400).json({ 
        error: "Statut invalide. Utilisez 'confirmee' ou 'annulee_tatoueur'" 
      });
    }

    // Récupérer la réservation
    const reservation = await Reservation.findById(id);
    if (!reservation) {
      return res.status(404).json({ error: "Réservation non trouvée" });
    }

    // Vérifier que c'est bien le tatoueur concerné
    if (reservation.idTatoueur.toString() !== idTatoueur.toString()) {
      return res.status(403).json({ error: "Accès interdit" });
    }

    // Vérifier que la réservation est en attente
    if (reservation.statut !== 'en_attente') {
      return res.status(400).json({ 
        error: "Cette réservation n'est plus en attente" 
      });
    }

    // Mettre à jour la réservation
    const updateData = {
      statut,
      dateReponse: new Date(),
      messageTatoueur: messageTatoueur ? messageTatoueur.trim() : ''
    };

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const updatedReservation = await Reservation.findByIdAndUpdate(
        id,
        updateData,
        { new: true, session }
      );

      // Si annulée, libérer le flash
      if (statut === 'annulee_tatoueur') {
        await Flash.findByIdAndUpdate(
          reservation.idFlash,
          { reserve: false },
          { session }
        );
      }

      await session.commitTransaction();

      // Récupérer la réservation complète
      const populatedReservation = await Reservation.findById(updatedReservation._id)
        .populate('idClient', 'nom prenom email')
        .populate('idFlash', 'image prix description')
        .populate('idTatoueur', 'nom prenom email');

      res.status(200).json(populatedReservation);

    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Annuler une réservation (client)
const cancelReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const { raisonAnnulation } = req.body;
    const idClient = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID réservation invalide" });
    }

    // Récupérer la réservation
    const reservation = await Reservation.findById(id);
    if (!reservation) {
      return res.status(404).json({ error: "Réservation non trouvée" });
    }

    // Vérifier que c'est bien le client concerné
    if (reservation.idClient.toString() !== idClient.toString()) {
      return res.status(403).json({ error: "Accès interdit" });
    }

    // Vérifier que la réservation peut être annulée
    if (!['en_attente', 'confirmee'].includes(reservation.statut)) {
      return res.status(400).json({ 
        error: "Cette réservation ne peut plus être annulée" 
      });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Mettre à jour la réservation
      const updatedReservation = await Reservation.findByIdAndUpdate(
        id,
        {
          statut: 'annulee_client',
          dateAnnulation: new Date(),
          raisonAnnulation: raisonAnnulation ? raisonAnnulation.trim() : ''
        },
        { new: true, session }
      );

      // Libérer le flash
      await Flash.findByIdAndUpdate(
        reservation.idFlash,
        { reserve: false },
        { session }
      );

      await session.commitTransaction();

      // Récupérer la réservation complète
      const populatedReservation = await Reservation.findById(updatedReservation._id)
        .populate('idClient', 'nom prenom email')
        .populate('idFlash', 'image prix description')
        .populate('idTatoueur', 'nom prenom email');

      res.status(200).json(populatedReservation);

    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Marquer une réservation comme terminée (tatoueur)
const completeReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const idTatoueur = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID réservation invalide" });
    }

    // Récupérer la réservation
    const reservation = await Reservation.findById(id);
    if (!reservation) {
      return res.status(404).json({ error: "Réservation non trouvée" });
    }

    // Vérifier que c'est bien le tatoueur concerné
    if (reservation.idTatoueur.toString() !== idTatoueur.toString()) {
      return res.status(403).json({ error: "Accès interdit" });
    }

    // Vérifier que la réservation est confirmée
    if (reservation.statut !== 'confirmee') {
      return res.status(400).json({ 
        error: "Seules les réservations confirmées peuvent être terminées" 
      });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Mettre à jour la réservation
      const updatedReservation = await Reservation.findByIdAndUpdate(
        id,
        { statut: 'terminee' },
        { new: true, session }
      );

      // Marquer le flash comme non disponible (tatouage réalisé)
      await Flash.findByIdAndUpdate(
        reservation.idFlash,
        { 
          disponible: false,
          reserve: false 
        },
        { session }
      );

      await session.commitTransaction();

      // Récupérer la réservation complète
      const populatedReservation = await Reservation.findById(updatedReservation._id)
        .populate('idClient', 'nom prenom email')
        .populate('idFlash', 'image prix description')
        .populate('idTatoueur', 'nom prenom email');

      res.status(200).json(populatedReservation);

    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Récupérer toutes les réservations avec filtres
const getReservations = async (req, res) => {
  try {
    const { 
      statut, 
      client, 
      tatoueur, 
      page = 1, 
      limit = 10 
    } = req.query;

    // Construction du filtre
    const filter = {};
    if (statut) filter.statut = statut;
    if (client && mongoose.Types.ObjectId.isValid(client)) {
      filter.idClient = client;
    }
    if (tatoueur && mongoose.Types.ObjectId.isValid(tatoueur)) {
      filter.idTatoueur = tatoueur;
    }

    const reservations = await Reservation.find(filter)
      .populate('idClient', 'nom prenom email avatar')
      .populate('idFlash', 'image prix description')
      .populate('idTatoueur', 'nom prenom email avatar')
      .sort({ dateReservation: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Reservation.countDocuments(filter);

    res.status(200).json({
      reservations,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Récupérer les réservations d'un utilisateur
const getMyReservations = async (req, res) => {
  try {
    const userId = req.user._id;
    const { statut, page = 1, limit = 10 } = req.query;

    // Déterminer si l'utilisateur est client ou tatoueur
    const userType = req.user.role || 'client'; // Assumons qu'il y a un champ role

    const filter = {};
    if (statut) filter.statut = statut;

    // Construire le filtre selon le type d'utilisateur
    if (userType === 'tatoueur') {
      filter.idTatoueur = userId;
    } else {
      filter.idClient = userId;
    }

    const reservations = await Reservation.find(filter)
      .populate('idClient', 'nom prenom email avatar')
      .populate('idFlash', 'image prix description')
      .populate('idTatoueur', 'nom prenom email avatar')
      .sort({ dateReservation: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Reservation.countDocuments(filter);

    res.status(200).json({
      reservations,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      total,
      userType
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Récupérer une réservation par ID
const getReservationById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID réservation invalide" });
    }

    const reservation = await Reservation.findById(id)
      .populate('idClient', 'nom prenom email avatar')
      .populate('idFlash', 'image prix description')
      .populate('idTatoueur', 'nom prenom email avatar');

    if (!reservation) {
      return res.status(404).json({ error: "Réservation non trouvée" });
    }

    // Vérifier que l'utilisateur a le droit de voir cette réservation
    const isAuthorized = reservation.idClient._id.toString() === userId.toString() ||
                        reservation.idTatoueur._id.toString() === userId.toString();

    if (!isAuthorized) {
      return res.status(403).json({ error: "Accès interdit" });
    }

    res.status(200).json(reservation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createReservation,
  respondToReservation,
  cancelReservation,
  completeReservation,
  getReservations,
  getMyReservations,
  getReservationById
};