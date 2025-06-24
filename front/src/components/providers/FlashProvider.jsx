import React, { useState, useEffect, useCallback } from "react";
import { flashApi } from "../../api/flash.api";
import { FlashContext } from "../../context/FlashContext";

export default function FlashProvider({ children }) {
  // ✅ États pour les flashs
  const [followedFlashes, setFollowedFlashes] = useState([]);
  const [recommendedFlashes, setRecommendedFlashes] = useState([]);
  const [savedFlashes, setSavedFlashes] = useState([]);
  const [allFlashes, setAllFlashes] = useState([]);

  // ✅ NOUVEAU: Cache des flashs individuels pour synchronisation
  const [flashsCache, setFlashsCache] = useState(new Map());

  // ✅ États de contrôle
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  // ✅ États de pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // ✅ NOUVELLE FONCTION: Mettre à jour un flash dans toutes les listes
  const updateFlashInAllLists = useCallback((flashId, updatedFlash) => {
    const updateFlashInList = (flashList, setFlashList) => {
      setFlashList((prev) =>
        prev.map((flash) =>
          (flash._id === flashId || flash.id === flashId) ? updatedFlash : flash
        )
      );
    };

    updateFlashInList(allFlashes, setAllFlashes);
    updateFlashInList(followedFlashes, setFollowedFlashes);
    updateFlashInList(recommendedFlashes, setRecommendedFlashes);
    updateFlashInList(savedFlashes, setSavedFlashes);
  }, [allFlashes, followedFlashes, recommendedFlashes, savedFlashes]);

  // ✅ NOUVELLE FONCTION: Mettre à jour un flash dans le cache et toutes les listes
  const updateFlashInCache = useCallback((flashId, updatedFlash) => {
    // Mettre à jour le cache
    setFlashsCache(prev => {
      const newCache = new Map(prev);
      newCache.set(flashId, updatedFlash);
      return newCache;
    });

    // Mettre à jour dans toutes les listes
    updateFlashInAllLists(flashId, updatedFlash);

    // Émettre un événement global pour notifier tous les composants
    window.dispatchEvent(new CustomEvent('flashUpdated', {
      detail: { flashId, updatedFlash }
    }));
  }, [updateFlashInAllLists]);

  // ✅ NOUVEAU: Système d'événements pour synchronisation
  useEffect(() => {
    const handleFlashUpdated = (event) => {
      const { flashId, updatedFlash } = event.detail;
      console.log("🔄 FlashContext - Flash mis à jour via événement:", flashId);
      
      // Mettre à jour dans toutes les listes
      updateFlashInAllLists(flashId, updatedFlash);
    };

    window.addEventListener('flashUpdated', handleFlashUpdated);
    
    return () => {
      window.removeEventListener('flashUpdated', handleFlashUpdated);
    };
  }, [updateFlashInAllLists]);

  // ✅ NOUVELLE FONCTION: Récupérer un flash depuis le cache ou l'API
  const getFlashFromCache = useCallback((flashId) => {
    return flashsCache.get(flashId);
  }, [flashsCache]);

  // ✅ Fonction pour récupérer l'utilisateur actuel
  const getCurrentUser = useCallback(() => {
    try {
      // Méthode 1: localStorage 'user'
      const userFromStorage = localStorage.getItem("user");
      if (userFromStorage) {
        const user = JSON.parse(userFromStorage);
        return user._id || user.id;
      }

      // Méthode 2: localStorage alternatives
      const altKeys = ["currentUser", "authUser", "loggedUser"];
      for (const key of altKeys) {
        const userData = localStorage.getItem(key);
        if (userData) {
          const user = JSON.parse(userData);
          return user._id || user.id;
        }
      }

      // Méthode 3: Cookies JWT
      const cookies = document.cookie.split("; ");
      const tokenCookie = cookies.find((row) => row.startsWith("token="));
      if (tokenCookie) {
        const token = tokenCookie.split("=")[1];
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          return payload.sub || payload.userId || payload.id || payload._id;
        } catch (jwtError) {
          console.error("Erreur décodage JWT:", jwtError);
        }
      }

      return null;
    } catch (error) {
      console.error("Erreur récupération utilisateur:", error);
      return null;
    }
  }, []);

  // ✅ FONCTION: Charger les flashs sauvegardés
  const loadSavedFlashes = useCallback(async () => {
    if (!currentUserId) return;

    try {
      console.log("💾 FlashContext - Chargement flashs sauvegardés");

      const response = await flashApi.getSavedFlashs({
        page: 1,
        limit: 50,
      });

      console.log("✅ FlashContext - Flashs sauvegardés:", response);
      const savedFlashs = response.flashs || [];
      setSavedFlashes(savedFlashs);

      // ✅ NOUVEAU: Mettre à jour le cache avec les flashs sauvegardés
      setFlashsCache(prev => {
        const newCache = new Map(prev);
        savedFlashs.forEach(flash => {
          const flashId = flash._id || flash.id;
          newCache.set(flashId, flash);
        });
        return newCache;
      });
    } catch (err) {
      console.error("❌ FlashContext - Erreur flashs sauvegardés:", err);
    }
  }, [currentUserId]);

  // ✅ FONCTION: Charger les flashs initiaux
  const loadInitialFlashes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("📥 FlashContext - Chargement flashs initiaux");

      // Charger tous les flashs (pour recommendations)
      const response = await flashApi.getFlashs({
        page: 1,
        limit: 20,
        sortBy: "date",
        order: "desc",
      });

      console.log("✅ FlashContext - Flashs chargés:", response);

      const flashs = response.flashs || [];
      setAllFlashes(flashs);

      // ✅ NOUVEAU: Mettre à jour le cache avec les flashs chargés
      setFlashsCache(prev => {
        const newCache = new Map(prev);
        flashs.forEach(flash => {
          const flashId = flash._id || flash.id;
          newCache.set(flashId, flash);
        });
        return newCache;
      });

      // Pour l'instant, on met tout dans recommended
      // Plus tard, on pourra filtrer selon les tatoueurs suivis
      setRecommendedFlashes(flashs);
      setFollowedFlashes([]); // À implémenter avec le système de follow

      setCurrentPage(response.currentPage || 1);
      setTotalPages(response.totalPages || 1);
      setHasMore(response.currentPage < response.totalPages);
    } catch (err) {
      console.error("❌ FlashContext - Erreur chargement flashs:", err);
      setError(err.message || "Erreur lors du chargement des flashs");
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Initialiser l'utilisateur au montage
  useEffect(() => {
    const userId = getCurrentUser();
    setCurrentUserId(userId);
    console.log("👤 FlashContext - User ID:", userId);
  }, [getCurrentUser]);

  // ✅ Charger les flashs au montage
  useEffect(() => {
    if (currentUserId) {
      loadInitialFlashes();
      loadSavedFlashes();
    } else {
      // Charger les flashs publics même sans utilisateur
      loadInitialFlashes();
    }
  }, [currentUserId, loadInitialFlashes, loadSavedFlashes]);

  // ✅ FIX: Stabiliser getFlashesByTatoueur avec useCallback
  const getFlashesByTatoueur = useCallback(async (tatoueurId, params = {}) => {
    try {
      console.log("👨‍🎨 FlashContext - getFlashesByTatoueur:", tatoueurId);

      const response = await flashApi.getFlashsByTatoueur(tatoueurId, params);
      console.log("✅ FlashContext - Flashs tatoueur:", response);

      const flashs = response.flashs || [];

      // Mettre à jour le cache
      setFlashsCache(prev => {
        const newCache = new Map(prev);
        flashs.forEach(flash => {
          const flashId = flash._id || flash.id;
          newCache.set(flashId, flash);
        });
        return newCache;
      });

      return flashs;
    } catch (err) {
      console.error("❌ FlashContext - Erreur flashs tatoueur:", err);
      throw err;
    }
  }, []); // Pas de dépendances car la fonction est stable

  // ✅ FONCTION MODIFIÉE: Récupérer un flash par ID avec cache
  const getFlashById = useCallback(async (flashId) => {
    try {
      console.log("🔍 FlashContext - getFlashById:", flashId);

      // Vérifier d'abord le cache
      const cachedFlash = getFlashFromCache(flashId);
      if (cachedFlash) {
        console.log("📋 FlashContext - Flash trouvé dans le cache:", flashId);
        return cachedFlash;
      }

      // Sinon, charger depuis l'API
      const flash = await flashApi.getFlashById(flashId);
      console.log("✅ FlashContext - Flash chargé depuis l'API:", flash);

      // Mettre à jour le cache
      updateFlashInCache(flashId, flash);

      return flash;
    } catch (err) {
      console.error("❌ FlashContext - Erreur getFlashById:", err);
      throw err;
    }
  }, [getFlashFromCache, updateFlashInCache]);

  // ✅ NOUVELLES FONCTIONS: Gestion des commentaires avec synchronisation
  const addCommentToFlash = useCallback(async (flashId, contenu) => {
    try {
      console.log("💬 FlashContext - Ajout commentaire:", flashId, contenu);
      
      const updatedFlash = await flashApi.addComment(flashId, contenu);
      
      // Mettre à jour le cache et toutes les listes
      updateFlashInCache(flashId, updatedFlash);
      
      return updatedFlash;
    } catch (error) {
      console.error("❌ FlashContext - Erreur ajout commentaire:", error);
      throw error;
    }
  }, [updateFlashInCache]);

  const likeCommentInFlash = useCallback(async (flashId, commentId) => {
    try {
      console.log("👍 FlashContext - Like commentaire:", flashId, commentId);
      
      const updatedFlash = await flashApi.likeComment(flashId, commentId);
      
      // Mettre à jour le cache et toutes les listes
      updateFlashInCache(flashId, updatedFlash);
      
      return updatedFlash;
    } catch (error) {
      console.error("❌ FlashContext - Erreur like commentaire:", error);
      throw error;
    }
  }, [updateFlashInCache]);

  const addReplyToComment = useCallback(async (flashId, commentId, contenu) => {
    try {
      console.log("💬 FlashContext - Ajout réponse:", flashId, commentId, contenu);
      
      const updatedFlash = await flashApi.addReplyToComment(flashId, commentId, contenu);
      
      // Mettre à jour le cache et toutes les listes
      updateFlashInCache(flashId, updatedFlash);
      
      return updatedFlash;
    } catch (error) {
      console.error("❌ FlashContext - Erreur ajout réponse:", error);
      throw error;
    }
  }, [updateFlashInCache]);

  const likeReplyInFlash = useCallback(async (flashId, commentId, replyId) => {
    try {
      console.log("👍 FlashContext - Like réponse:", flashId, commentId, replyId);
      
      const updatedFlash = await flashApi.likeReply(flashId, commentId, replyId);
      
      // Mettre à jour le cache et toutes les listes
      updateFlashInCache(flashId, updatedFlash);
      
      return updatedFlash;
    } catch (error) {
      console.error("❌ FlashContext - Erreur like réponse:", error);
      throw error;
    }
  }, [updateFlashInCache]);

  const deleteCommentFromFlash = useCallback(async (flashId, commentId) => {
    try {
      console.log("🗑️ FlashContext - Suppression commentaire:", flashId, commentId);
      
      await flashApi.deleteComment(flashId, commentId);
      
      // Recharger le flash depuis l'API pour avoir les données à jour
      const updatedFlash = await flashApi.getFlashById(flashId);
      
      // Mettre à jour le cache et toutes les listes
      updateFlashInCache(flashId, updatedFlash);
      
      return updatedFlash;
    } catch (error) {
      console.error("❌ FlashContext - Erreur suppression commentaire:", error);
      throw error;
    }
  }, [updateFlashInCache]);

  const deleteReplyFromFlash = useCallback(async (flashId, commentId, replyId) => {
    try {
      console.log("🗑️ FlashContext - Suppression réponse:", flashId, commentId, replyId);
      
      await flashApi.deleteReply(flashId, commentId, replyId);
      
      // Recharger le flash depuis l'API pour avoir les données à jour
      const updatedFlash = await flashApi.getFlashById(flashId);
      
      // Mettre à jour le cache et toutes les listes
      updateFlashInCache(flashId, updatedFlash);
      
      return updatedFlash;
    } catch (error) {
      console.error("❌ FlashContext - Erreur suppression réponse:", error);
      throw error;
    }
  }, [updateFlashInCache]);

  // ✅ FONCTION: Créer un nouveau flash
  const addFlash = useCallback(async (flashData) => {
    try {
      console.log("📤 FlashContext - Création flash:", flashData);
      setLoading(true);

      const newFlash = await flashApi.createFlash(flashData);
      console.log("✅ FlashContext - Flash créé:", newFlash);

      // Ajouter le nouveau flash en haut de la liste et dans le cache
      const flashId = newFlash._id || newFlash.id;
      setFlashsCache(prev => {
        const newCache = new Map(prev);
        newCache.set(flashId, newFlash);
        return newCache;
      });

      setAllFlashes((prev) => [newFlash, ...prev]);
      setFollowedFlashes((prev) => [newFlash, ...prev]);

      return newFlash;
    } catch (err) {
      console.error("❌ FlashContext - Erreur création flash:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ FONCTION MODIFIÉE: Liker/Unliker un flash avec synchronisation
  const toggleLikeFlash = useCallback(async (flashId) => {
    try {
      console.log("👍 FlashContext - toggleLikeFlash:", flashId);

      const updatedFlash = await flashApi.likeFlash(flashId);
      console.log("✅ FlashContext - Flash liké:", updatedFlash);

      // Mettre à jour le cache et toutes les listes
      updateFlashInCache(flashId, updatedFlash);

      return updatedFlash;
    } catch (err) {
      console.error("❌ FlashContext - Erreur like flash:", err);
      throw err;
    }
  }, [updateFlashInCache]);

  // ✅ FONCTION: Sauvegarder/Désauvegarder un flash
  const toggleSaveFlash = useCallback(async (flash) => {
    if (!currentUserId) {
      throw new Error("Vous devez être connecté pour sauvegarder un flash");
    }

    try {
      console.log("💾 FlashContext - toggleSaveFlash:", flash._id || flash.id);

      const flashId = flash._id || flash.id;
      const isAlreadySaved = savedFlashes.some(
        (saved) => (saved._id || saved.id) === flashId
      );

      if (isAlreadySaved) {
        // Désauvegarder
        await flashApi.unsaveFlash(flashId);
        setSavedFlashes((prev) =>
          prev.filter((saved) => (saved._id || saved.id) !== flashId)
        );
        console.log("✅ Flash retiré des favoris");
      } else {
        // Sauvegarder
        await flashApi.saveFlash(flashId);
        // Recharger la liste complète pour avoir les données à jour
        await loadSavedFlashes();
        console.log("✅ Flash ajouté aux favoris");
      }
    } catch (err) {
      console.error("❌ FlashContext - Erreur save flash:", err);
      throw err;
    }
  }, [currentUserId, savedFlashes, loadSavedFlashes]);

  // ✅ FONCTION: Réserver un flash
  const reserveFlash = useCallback(async (flashId) => {
    try {
      console.log("📅 FlashContext - reserveFlash:", flashId);

      const response = await flashApi.reserveFlash(flashId);
      console.log("✅ FlashContext - Flash réservé:", response);

      // Mettre à jour le flash dans toutes les listes et le cache
      const updatedFlash = {
        ...getFlashFromCache(flashId),
        reserve: true,
        reservedBy: currentUserId,
        reservedAt: new Date(),
      };

      updateFlashInCache(flashId, updatedFlash);

      return response;
    } catch (err) {
      console.error("❌ FlashContext - Erreur réservation flash:", err);
      throw err;
    }
  }, [getFlashFromCache, updateFlashInCache, currentUserId]);

  // ✅ FONCTION: Supprimer un flash
  const deleteFlash = useCallback(async (flashId) => {
    try {
      console.log("🗑️ FlashContext - deleteFlash:", flashId);

      await flashApi.deleteFlash(flashId);
      console.log("✅ FlashContext - Flash supprimé");

      // Retirer le flash du cache
      setFlashsCache(prev => {
        const newCache = new Map(prev);
        newCache.delete(flashId);
        return newCache;
      });

      // Retirer le flash de toutes les listes
      const removeFlashFromList = (flashList, setFlashList) => {
        setFlashList((prev) =>
          prev.filter((flash) => flash._id !== flashId && flash.id !== flashId)
        );
      };

      removeFlashFromList(allFlashes, setAllFlashes);
      removeFlashFromList(followedFlashes, setFollowedFlashes);
      removeFlashFromList(recommendedFlashes, setRecommendedFlashes);
      removeFlashFromList(savedFlashes, setSavedFlashes);
    } catch (err) {
      console.error("❌ FlashContext - Erreur suppression flash:", err);
      throw err;
    }
  }, [allFlashes, followedFlashes, recommendedFlashes, savedFlashes]);

  // ✅ FONCTION: Charger plus de flashs
  const loadMoreFlashes = useCallback(async () => {
    if (!hasMore || loading) return;

    try {
      setLoading(true);

      const nextPage = currentPage + 1;
      console.log("📥 FlashContext - Chargement page:", nextPage);

      const response = await flashApi.getFlashs({
        page: nextPage,
        limit: 20,
        sortBy: "date",
        order: "desc",
      });

      const newFlashes = response.flashs || [];

      if (newFlashes.length > 0) {
        // Ajouter au cache
        setFlashsCache(prev => {
          const newCache = new Map(prev);
          newFlashes.forEach(flash => {
            const flashId = flash._id || flash.id;
            newCache.set(flashId, flash);
          });
          return newCache;
        });

        setAllFlashes((prev) => [...prev, ...newFlashes]);
        setRecommendedFlashes((prev) => [...prev, ...newFlashes]);
        setCurrentPage(nextPage);
        setHasMore(nextPage < response.totalPages);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("❌ FlashContext - Erreur load more:", err);
    } finally {
      setLoading(false);
    }
  }, [hasMore, loading, currentPage]);

  // ✅ FONCTION: Rechercher des flashs
  const searchFlashes = useCallback(async (searchParams) => {
    try {
      setLoading(true);
      setError(null);

      console.log("🔍 FlashContext - Recherche flashs:", searchParams);

      const response = await flashApi.getFlashs({
        ...searchParams,
        page: 1,
        limit: 20,
      });

      const flashs = response.flashs || [];
      setAllFlashes(flashs);
      setRecommendedFlashes(flashs);
      setCurrentPage(1);
      setTotalPages(response.totalPages || 1);
      setHasMore(response.currentPage < response.totalPages);

      // Mettre à jour le cache
      setFlashsCache(prev => {
        const newCache = new Map(prev);
        flashs.forEach(flash => {
          const flashId = flash._id || flash.id;
          newCache.set(flashId, flash);
        });
        return newCache;
      });

      return response;
    } catch (err) {
      console.error("❌ FlashContext - Erreur recherche:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ FONCTION: Vérifier si un flash est sauvegardé
  const isFlashSaved = useCallback((flashId) => {
    return savedFlashes.some((flash) => (flash._id || flash.id) === flashId);
  }, [savedFlashes]);

  // ✅ FONCTION: Vérifier si l'utilisateur a liké un flash
  const hasUserLiked = useCallback((flash) => {
    if (!flash.likes || !currentUserId) return false;
    return flash.likes.some(
      (like) => (like.userId?._id || like.userId) === currentUserId
    );
  }, [currentUserId]);

  // ✅ FONCTION: Obtenir le nombre de likes d'un flash
  const getLikesCount = useCallback((flash) => {
    return flash.likesCount || flash.likes?.length || 0;
  }, []);

  // ✅ FONCTION: Rafraîchir les données
  const refreshData = useCallback(async () => {
    try {
      setError(null);
      await loadInitialFlashes();
      if (currentUserId) {
        await loadSavedFlashes();
      }
    } catch (err) {
      console.error("❌ FlashContext - Erreur refresh:", err);
      setError(err.message);
    }
  }, [loadInitialFlashes, loadSavedFlashes, currentUserId]);

  // ✅ FONCTION: Nettoyer les erreurs
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ✅ FONCTIONS UTILITAIRES (compatibilité avec l'ancien contexte)
  const getFlashesByTag = useCallback((tag) => {
    return allFlashes.filter((flash) =>
      flash.tags?.some((flashTag) =>
        flashTag.toLowerCase().includes(tag.toLowerCase())
      )
    );
  }, [allFlashes]);

  const getFlashesByArtist = useCallback((artistId) => {
    return allFlashes.filter(
      (flash) => (flash.idTatoueur?._id || flash.idTatoueur) === artistId
    );
  }, [allFlashes]);

  // ✅ Valeur du contexte
  const value = {
    // États
    followedFlashes,
    recommendedFlashes,
    savedFlashes,
    allFlashes,
    loading,
    error,
    currentUserId,
    flashsCache,

    // Pagination
    currentPage,
    totalPages,
    hasMore,

    // Fonctions principales
    getFlashById,
    addFlash,
    deleteFlash,

    // Interactions
    toggleLikeFlash,
    toggleSaveFlash,
    reserveFlash,

    // ✅ NOUVELLES FONCTIONS: Gestion des commentaires
    addCommentToFlash,
    likeCommentInFlash,
    addReplyToComment,
    likeReplyInFlash,
    deleteCommentFromFlash,
    deleteReplyFromFlash,

    // Cache et synchronisation
    updateFlashInCache,
    getFlashFromCache,

    // Recherche et filtrage
    searchFlashes,
    getFlashesByTatoueur,
    getFlashesByTag,
    getFlashesByArtist,
    loadMoreFlashes,

    // Utilitaires
    isFlashSaved,
    hasUserLiked,
    getLikesCount,
    refreshData,
    clearError,

    // Setters pour compatibilité
    setFollowedFlashes,
    setRecommendedFlashes,
    setSavedFlashes,
    setAllFlashes,
  };

  return (
    <FlashContext.Provider value={value}>{children}</FlashContext.Provider>
  );
}