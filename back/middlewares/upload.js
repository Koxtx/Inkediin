const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Créer les dossiers s'ils n'existent pas
const uploadDirs = {
  flashs: 'uploads/flashs/',
  feeds: 'uploads/feeds/'
};

Object.values(uploadDirs).forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configuration pour les flashs
const storageFlash = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirs.flashs);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'flash-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilterFlash = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Format d\'image non supporté. Utilisez JPEG, PNG ou WebP'), false);
  }
};

const uploadFlash = multer({
  storage: storageFlash,
  fileFilter: fileFilterFlash,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB pour les images de qualité
  }
});

// Configuration pour les feeds
const storageFeed = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirs.feeds);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilterFeed = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Seules les images sont autorisées'), false);
  }
};

const uploadFeed = multer({
  storage: storageFeed,
  fileFilter: fileFilterFeed,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

module.exports = {
  uploadFlash,
  uploadFeed
};