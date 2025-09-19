import React, { useState, useEffect, useCallback } from "react";
import { flashApi } from "../../api/flash.api";
import { FlashContext } from "../../context/FlashContext";

export default function FlashProvider({ children }) {

  const [followedFlashes, setFollowedFlashes] = useState([]);
  const [recommendedFlashes, setRecommendedFlashes] = useState([]);
  const [savedFlashes, setSavedFlashes] = useState([]);
  const [allFlashes, setAllFlashes] = useState([]);


  const [flashsCache, setFlashsCache] = useState(new Map());


  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

 
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const updateFlashInAllLists = useCallback((flashId, updatedFlash) => {
    const updateFlashInList = (setFlashList) => {
      setFlashList((prev) =>
        prev.map((flash) =>
          (flash._id === flashId || flash.id === flashId) ? updatedFlash : flash
        )
      );
    };

    updateFlashInList(setAllFlashes);
    updateFlashInList(setFollowedFlashes);
    updateFlashInList(setRecommendedFlashes);
    updateFlashInList(setSavedFlashes);
  }, []);

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
  }, []); // Suppression de la dépendance pour éviter les re-rendus excessifs

 
  useEffect(() => {
    const handleFlashUpdated = (event) => {
      const { flashId, updatedFlash } = event.detail;
     
      
      // Mettre à jour dans toutes les listes
      updateFlashInAllLists(flashId, updatedFlash);
    };

    window.addEventListener('flashUpdated', handleFlashUpdated);
    
    return () => {
      window.removeEventListener('flashUpdated', handleFlashUpdated);
    };
  }, [updateFlashInAllLists]);

  
  const getFlashFromCache = useCallback((flashId) => {
    return flashsCache.get(flashId);
  }, [flashsCache]);


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

 
  const loadSavedFlashes = useCallback(async () => {
    if (!currentUserId) return;

    try {
     

      const response = await flashApi.getSavedFlashs({
        page: 1,
        limit: 50,
      });

     
      const savedFlashs = response.flashs || [];
      setSavedFlashes(savedFlashs);

    
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

 
  const loadInitialFlashes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

    

      // Charger tous les flashs (pour recommendations)
      const response = await flashApi.getFlashs({
        page: 1,
        limit: 20,
        sortBy: "date",
        order: "desc",
      });

      

      const flashs = response.flashs || [];
      setAllFlashes(flashs);

      
      setFlashsCache(prev => {
        const newCache = new Map(prev);
        flashs.forEach(flash => {
          const flashId = flash._id || flash.id;
          newCache.set(flashId, flash);
        });
        return newCache;
      });

   
      setRecommendedFlashes(flashs);
      setFollowedFlashes([]); 

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

  
  useEffect(() => {
    const userId = getCurrentUser();
    setCurrentUserId(userId);
    
  }, []); // Suppression de la dépendance getCurrentUser pour éviter la boucle


  useEffect(() => {
    if (currentUserId) {
      loadInitialFlashes();
      loadSavedFlashes();
    } else {
     
      loadInitialFlashes();
    }
  }, [currentUserId]); // Suppression des dépendances de fonction pour éviter la boucle


  const getFlashesByTatoueur = useCallback(async (tatoueurId, params = {}) => {
    try {
     

      const response = await flashApi.getFlashsByTatoueur(tatoueurId, params);
    

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

  
  const getFlashById = useCallback(async (flashId) => {
    try {
    

      // Vérifier d'abord le cache
      const cachedFlash = getFlashFromCache(flashId);
      if (cachedFlash) {
       
        return cachedFlash;
      }

      // Sinon, charger depuis l'API
      const flash = await flashApi.getFlashById(flashId);
     

      // Mettre à jour le cache
      updateFlashInCache(flashId, flash);

      return flash;
    } catch (err) {
      console.error("❌ FlashContext - Erreur getFlashById:", err);
      throw err;
    }
  }, [getFlashFromCache, updateFlashInCache]);

 
  const addCommentToFlash = useCallback(async (flashId, contenu) => {
    try {
     
      
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

  
  const addFlash = useCallback(async (flashData) => {
    try {
      
      setLoading(true);

      const newFlash = await flashApi.createFlash(flashData);
      

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

 
  const toggleLikeFlash = useCallback(async (flashId) => {
    try {
    

      const updatedFlash = await flashApi.likeFlash(flashId);
     

      // Mettre à jour le cache et toutes les listes
      updateFlashInCache(flashId, updatedFlash);

      return updatedFlash;
    } catch (err) {
      console.error("❌ FlashContext - Erreur like flash:", err);
      throw err;
    }
  }, [updateFlashInCache]);

  
  const toggleSaveFlash = useCallback(async (flash) => {
    if (!currentUserId) {
      throw new Error("Vous devez être connecté pour sauvegarder un flash");
    }

    try {
  

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
       
      } else {
        // Sauvegarder
        await flashApi.saveFlash(flashId);
        // Recharger la liste complète pour avoir les données à jour
        await loadSavedFlashes();
       
      }
    } catch (err) {
      console.error("❌ FlashContext - Erreur save flash:", err);
      throw err;
    }
  }, [currentUserId, savedFlashes, loadSavedFlashes]);


  const reserveFlash = useCallback(async (flashId) => {
    try {
    

      const response = await flashApi.reserveFlash(flashId);
    

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

 
  const deleteFlash = useCallback(async (flashId) => {
    try {
      

      await flashApi.deleteFlash(flashId);
     

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

 
  const loadMoreFlashes = useCallback(async () => {
    if (!hasMore || loading) return;

    try {
      setLoading(true);

      const nextPage = currentPage + 1;
     

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

 
  const searchFlashes = useCallback(async (searchParams) => {
    try {
      setLoading(true);
      setError(null);

   

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

 
  const isFlashSaved = useCallback((flashId) => {
    return savedFlashes.some((flash) => (flash._id || flash.id) === flashId);
  }, [savedFlashes]);

  
  const hasUserLiked = useCallback((flash) => {
    if (!flash.likes || !currentUserId) return false;
    return flash.likes.some(
      (like) => (like.userId?._id || like.userId) === currentUserId
    );
  }, [currentUserId]);

  
  const getLikesCount = useCallback((flash) => {
    return flash.likesCount || flash.likes?.length || 0;
  }, []);

  
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

  
  const clearError = useCallback(() => {
    setError(null);
  }, []);

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

  
  const value = {
    
    followedFlashes,
    recommendedFlashes,
    savedFlashes,
    allFlashes,
    loading,
    error,
    currentUserId,
    flashsCache,

    
    currentPage,
    totalPages,
    hasMore,

    
    getFlashById,
    addFlash,
    deleteFlash,

    
    toggleLikeFlash,
    toggleSaveFlash,
    reserveFlash,

   
    addCommentToFlash,
    likeCommentInFlash,
    addReplyToComment,
    likeReplyInFlash,
    deleteCommentFromFlash,
    deleteReplyFromFlash,

   
    updateFlashInCache,
    getFlashFromCache,

    
    searchFlashes,
    getFlashesByTatoueur,
    getFlashesByTag,
    getFlashesByArtist,
    loadMoreFlashes,

   
    isFlashSaved,
    hasUserLiked,
    getLikesCount,
    refreshData,
    clearError,

    
    setFollowedFlashes,
    setRecommendedFlashes,
    setSavedFlashes,
    setAllFlashes,
  };

  return (
    <FlashContext.Provider value={value}>{children}</FlashContext.Provider>
  );
}