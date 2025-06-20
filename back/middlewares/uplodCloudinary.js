const multer = require('multer');
const cloudinary = require('cloudinary').v2;

// Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Vérifier la configuration
const isCloudinaryConfigured = () => {
  const { cloud_name, api_key, api_secret } = cloudinary.config();
  const isValid = cloud_name && api_key && api_secret;
  
  if (isValid) {
    console.log('✅ Cloudinary configuré:', { cloud_name });
  } else {
    console.log('❌ Cloudinary non configuré - Variables manquantes:', {
      cloud_name: !!cloud_name,
      api_key: !!api_key,
      api_secret: !!api_secret
    });
  }
  
  return isValid;
};

// Configuration de multer pour garder les fichiers en mémoire
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Format de fichier non supporté'), false);
  }
};

// Middleware pour Feed
const uploadFeed = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
}).single('image');

// Middleware pour Flash
const uploadFlash = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
}).single('image');

// Middleware pour uploader Feed vers Cloudinary
const uploadFeedToCloudinary = async (req, res, next) => {
  if (!req.file) {
    console.log('📝 Feed - Pas de fichier à uploader');
    return next();
  }

  if (!isCloudinaryConfigured()) {
    return res.status(500).json({ 
      error: 'Service d\'upload non configuré',
      details: 'Cloudinary credentials manquantes'
    });
  }

  try {
    console.log('☁️ Feed - Upload vers Cloudinary:', {
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    // Convertir le buffer en base64 pour Cloudinary
    const fileStr = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    // Options d'upload pour Feed
    const uploadOptions = {
      folder: 'tattoo-app/feeds',
      resource_type: 'image',
      transformation: [
        { width: 1080, height: 1080, crop: 'limit' },
        { quality: 'auto' },
        { format: 'auto' }
      ],
      public_id: `feed_${Date.now()}_${Math.random().toString(36).substring(7)}`
    };

    // Upload vers Cloudinary
    const result = await cloudinary.uploader.upload(fileStr, uploadOptions);

    console.log('✅ Feed - Upload Cloudinary réussi:', {
      publicId: result.public_id,
      url: result.secure_url,
      width: result.width,
      height: result.height,
      bytes: result.bytes
    });

    // Ajouter les données à la requête
    req.imageUrl = result.secure_url;
    req.imagePublicId = result.public_id;

    next();
  } catch (error) {
    console.error('❌ Feed - Erreur upload Cloudinary:', error);
    res.status(500).json({ 
      error: 'Erreur lors de l\'upload de l\'image',
      details: error.message 
    });
  }
};

// Middleware pour uploader Flash vers Cloudinary
const uploadFlashToCloudinary = async (req, res, next) => {
  if (!req.file) {
    console.log('📝 Flash - Pas de fichier à uploader');
    return next();
  }

  if (!isCloudinaryConfigured()) {
    return res.status(500).json({ 
      error: 'Service d\'upload non configuré',
      details: 'Cloudinary credentials manquantes'
    });
  }

  try {
    console.log('⚡ Flash - Upload vers Cloudinary:', {
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    const fileStr = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    // Options d'upload pour Flash
    const uploadOptions = {
      folder: 'tattoo-app/flash',
      resource_type: 'image',
      transformation: [
        { width: 800, height: 800, crop: 'limit' },
        { quality: 'auto' },
        { format: 'auto' }
      ],
      public_id: `flash_${Date.now()}_${Math.random().toString(36).substring(7)}`
    };

    const result = await cloudinary.uploader.upload(fileStr, uploadOptions);

    console.log('✅ Flash - Upload Cloudinary réussi:', {
      publicId: result.public_id,
      url: result.secure_url
    });

    req.imageUrl = result.secure_url;
    req.imagePublicId = result.public_id;

    next();
  } catch (error) {
    console.error('❌ Flash - Erreur upload Cloudinary:', error);
    res.status(500).json({ 
      error: 'Erreur lors de l\'upload de l\'image Flash',
      details: error.message 
    });
  }
};

// Fonction pour supprimer une image de Cloudinary
const deleteFromCloudinary = async (publicId) => {
  if (!publicId || !isCloudinaryConfigured()) return;

  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log('🗑️ Image supprimée de Cloudinary:', { publicId, result });
    return result;
  } catch (error) {
    console.error('❌ Erreur suppression Cloudinary:', error);
  }
};

// Fonction utilitaire pour générer des URLs optimisées
const getOptimizedImageUrl = (publicId, options = {}) => {
  if (!publicId) return null;

  const {
    width = 400,
    height = 400,
    crop = 'fill',
    quality = 'auto',
    format = 'auto'
  } = options;

  return cloudinary.url(publicId, {
    width,
    height,
    crop,
    quality,
    format,
    secure: true
  });
};

module.exports = { 
  uploadFeed,
  uploadFlash,
  uploadFeedToCloudinary,
  uploadFlashToCloudinary,
  deleteFromCloudinary,
  getOptimizedImageUrl,
  cloudinary
};