const { body, validationResult } = require("express-validator");

const validateFeed = [
  body("contenu")
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage("Le contenu doit contenir entre 1 et 2000 caractères"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

const validateComment = [
  body("contenu")
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage("Le commentaire doit contenir entre 1 et 500 caractères"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

const validateFlash = [
  body("prix")
    .isNumeric()
    .withMessage("Le prix doit être un nombre")
    .isFloat({ min: 0 })
    .withMessage("Le prix doit être positif"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("La description ne doit pas dépasser 1000 caractères"),

  body("disponible")
    .optional()
    .isBoolean()
    .withMessage("Disponible doit être un booléen"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

const validateFlashUpdate = [
  body("prix")
    .optional()
    .isNumeric()
    .withMessage("Le prix doit être un nombre")
    .isFloat({ min: 0 })
    .withMessage("Le prix doit être positif"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("La description ne doit pas dépasser 1000 caractères"),

  body("disponible")
    .optional()
    .isBoolean()
    .withMessage("Disponible doit être un booléen"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];
const validateReservation = [
  body("idFlash")
    .notEmpty()
    .withMessage("Flash ID requis")
    .isMongoId()
    .withMessage("Flash ID invalide"),

  body("messageClient")
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage("Le message doit contenir entre 10 et 1000 caractères"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

const validateReservationResponse = [
  body("statut")
    .isIn(["confirmee", "annulee_tatoueur"])
    .withMessage("Statut invalide"),

  body("messageTatoueur")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Le message ne doit pas dépasser 1000 caractères"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];
const validateMessage = [
  body("contenu")
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage("Le message doit contenir entre 1 et 2000 caractères"),

  body("destinataireId")
    .notEmpty()
    .withMessage("Destinataire requis")
    .isMongoId()
    .withMessage("ID destinataire invalide"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

const validateReservationMessage = [
  body("flashId")
    .notEmpty()
    .withMessage("Flash ID requis")
    .isMongoId()
    .withMessage("Flash ID invalide"),

  body("tatoueurId")
    .notEmpty()
    .withMessage("Tatoueur ID requis")
    .isMongoId()
    .withMessage("Tatoueur ID invalide"),

  body("contenu")
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage("Le message doit contenir entre 10 et 1000 caractères"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

module.exports = {
  validateFeed,
  validateComment,
  validateFlash,
  validateFlashUpdate,
  validateReservation,
  validateReservationResponse,
  validateMessage,
  validateReservationMessage,
};
