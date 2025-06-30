const multer = require('multer');
const cloudinary = require('cloudinary').v2;

// Configuration Cloudinary (même que pour les autres)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Vérifier la configuration
const isCloudinaryConfigured = () => {
  const { cloud_name, api_key, api_secret } = cloudinary.config();
  const isValid = cloud_name && api_key && api_secret;
  

  
  return isValid;
};

// Configuration de multer pour les avatars
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Format de fichier non supporté'), false);
  }
};

// Middleware pour photo de profil
const uploadAvatar = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 3 * 1024 * 1024 // 3MB pour les avatars
  }
}).single('photoProfil');

// Middleware pour uploader avatar vers Cloudinary
const uploadAvatarToCloudinary = async (req, res, next) => {
  if (!req.file) {
   
    return next();
  }

  if (!isCloudinaryConfigured()) {
    return res.status(500).json({ 
      error: 'Service d\'upload non configuré',
      details: 'Cloudinary credentials manquantes'
    });
  }

  try {
 

    // Convertir le buffer en base64 pour Cloudinary
    const fileStr = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    // Options d'upload spécifiques aux avatars
    const uploadOptions = {
      folder: 'tattoo-app/avatars',
      resource_type: 'image',
      transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'face' }, // Crop carré centré sur le visage
        { quality: 'auto' },
        { format: 'auto' }
      ],
      public_id: `avatar_${req.user._id}_${Date.now()}` // ID unique basé sur l'utilisateur
    };

    // Supprimer l'ancien avatar s'il existe
    if (req.user.cloudinaryAvatarId) {
      try {
        await cloudinary.uploader.destroy(req.user.cloudinaryAvatarId);
       
      } catch (deleteError) {
        console.warn('⚠️ Erreur suppression ancien avatar:', deleteError.message);
      }
    }

    // Upload vers Cloudinary
    const result = await cloudinary.uploader.upload(fileStr, uploadOptions);

   

    // Ajouter les données à la requête
    req.avatarUrl = result.secure_url;
    req.avatarPublicId = result.public_id;

    next();
  } catch (error) {
    console.error('❌ Avatar - Erreur upload Cloudinary:', error);
    res.status(500).json({ 
      error: 'Erreur lors de l\'upload de l\'avatar',
      details: error.message 
    });
  }
};

// Fonction pour supprimer un avatar de Cloudinary
const deleteAvatarFromCloudinary = async (publicId) => {
  if (!publicId || !isCloudinaryConfigured()) return;

  try {
    const result = await cloudinary.uploader.destroy(publicId);

    return result;
  } catch (error) {
    console.error('❌ Erreur suppression avatar Cloudinary:', error);
  }
};

module.exports = { 
  uploadAvatar,
  uploadAvatarToCloudinary,
  deleteAvatarFromCloudinary,
  cloudinary
};