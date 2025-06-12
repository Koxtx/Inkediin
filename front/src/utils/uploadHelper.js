// Version simple sans Supabase pour commencer
// Vous pourrez activer Supabase plus tard

/**
 * Valide un fichier image
 * @param {File} file - Le fichier à valider
 * @param {Object} options - Options de validation
 * @returns {Promise<{valid: boolean, error?: string}>}
 */
export function validateImageFile(file, options = {}) {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB par défaut
    allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  } = options;

  // Vérifier si c'est un fichier
  if (!file) {
    return { valid: false, error: 'Aucun fichier sélectionné' };
  }

  // Vérifier le type
  if (!allowedTypes.includes(file.type)) {
    return { 
      valid: false, 
      error: `Type de fichier non autorisé. Types acceptés: ${allowedTypes.join(', ')}` 
    };
  }

  // Vérifier la taille
  if (file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024));
    return { 
      valid: false, 
      error: `Le fichier est trop volumineux. Taille maximale: ${maxSizeMB}MB` 
    };
  }

  return { valid: true };
}

/**
 * Redimensionne une image avant upload
 * @param {File} file - Le fichier image
 * @param {number} maxWidth - Largeur maximale
 * @param {number} maxHeight - Hauteur maximale
 * @param {number} quality - Qualité JPEG (0-1)
 * @returns {Promise<File>}
 */
export function resizeImage(file, maxWidth = 800, maxHeight = 600, quality = 0.8) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculer les nouvelles dimensions
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      // Redimensionner l'image
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      // Convertir en blob puis en File
      canvas.toBlob((blob) => {
        const resizedFile = new File([blob], file.name, {
          type: file.type,
          lastModified: Date.now()
        });
        resolve(resizedFile);
      }, file.type, quality);
    };

    img.src = URL.createObjectURL(file);
  });
}

/**
 * Convertit un fichier en base64
 * @param {File} file - Le fichier à convertir
 * @returns {Promise<string>} - L'image en base64
 */
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
}

// Version commentée pour Supabase (à activer plus tard)
/*
import { supabase } from "../config/supabase";

export async function uploadImageToSupabase(file, bucket = 'images', folder = 'avatars', userId) {
  try {
    // Vérifier la configuration Supabase
    if (!supabase) {
      throw new Error("Supabase non configuré");
    }

    // Générer un nom de fichier unique
    const fileExtension = file.name.split('.').pop();
    const fileName = `${folder}/${userId}_${Date.now()}.${fileExtension}`;

    // Upload du fichier
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Erreur upload Supabase:', error);
      return {
        success: false,
        error: error.message
      };
    }

    // Obtenir l'URL publique
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return {
      success: true,
      url: publicUrl,
      path: fileName
    };

  } catch (error) {
    console.error('Erreur lors de l\'upload:', error);
    return {
      success: false,
      error: 'Erreur lors de l\'upload de l\'image'
    };
  }
}
*/