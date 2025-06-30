import { createClient } from "@supabase/supabase-js";

// Vérifier que les variables d'environnement sont bien définies
const supabaseUrl = import.meta.env.VITE_REACT_APP_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_REACT_APP_SUPABASE_KEY;

// Validation des variables d'environnement
if (!supabaseUrl) {
  console.error("❌ VITE_REACT_APP_SUPABASE_URL manquante dans les variables d'environnement");
  throw new Error("Configuration Supabase manquante: VITE_REACT_APP_SUPABASE_URL");
}

if (!supabaseKey) {
  console.error("❌ VITE_REACT_APP_SUPABASE_KEY manquante dans les variables d'environnement");
  throw new Error("Configuration Supabase manquante: VITE_REACT_APP_SUPABASE_KEY");
}

// Vérifier le format de l'URL
if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
  console.error("❌ Format d'URL Supabase invalide:", supabaseUrl);
  throw new Error("Format d'URL Supabase invalide");
}



export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
    },
  },
});

// Test de connexion (optionnel)
export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('users') // Remplacez par une table qui existe
      .select('*')
      .limit(1);
    
    if (error) {
      console.warn("⚠️ Test connexion Supabase échoué:", error.message);
      return false;
    }
    

    return true;
  } catch (error) {
    console.error("❌ Erreur test connexion Supabase:", error);
    return false;
  }
};