import React, { useState, useRef, useEffect } from "react";
import { Heart, MessageCircle, Eye, Star, MapPin, Circle, MoreVertical, Flag, Trash2, X, Bookmark, Share } from "lucide-react";

export default function FlashDetail() {
  const [commentText, setCommentText] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likes, setLikes] = useState(124);
  const [localComments, setLocalComments] = useState([
    {
      id: 1,
      username: "ArtLover84",
      text: "J'adore les couleurs ! Est-ce que ce serait possible de l'adapter un peu pour l'épaule ?",
      time: "il y a 2 jours",
      likes: 3,
      isLiked: false,
      replies: [
        {
          id: 11,
          username: "TattooArtist",
          text: "Bien sûr ! On peut l'adapter pour l'épaule sans problème. Contacte-moi en MP pour en discuter.",
          time: "il y a 1 jour",
          likes: 5,
          isLiked: false,
        }
      ]
    },
    {
      id: 2,
      username: "InkFan22",
      text: "Superbe design ! Les roses old school sont mes préférées. Quel est ton délai d'attente pour une réservation ?",
      time: "il y a 10 heures",
      likes: 8,
      isLiked: false,
      replies: []
    },
  ]);
  
  const menuRef = useRef(null);
  const currentUser = "current_user";
  const isOwnPost = false;

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes(prevLikes => isLiked ? prevLikes - 1 : prevLikes + 1);
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
  };

  const handleCommentLike = (commentId, isReply = false, parentCommentId = null) => {
    if (isReply) {
      setLocalComments(prevComments => 
        prevComments.map(comment => 
          comment.id === parentCommentId 
            ? {
                ...comment,
                replies: comment.replies.map(reply =>
                  reply.id === commentId
                    ? { 
                        ...reply, 
                        isLiked: !reply.isLiked,
                        likes: reply.isLiked ? reply.likes - 1 : reply.likes + 1
                      }
                    : reply
                )
              }
            : comment
        )
      );
    } else {
      setLocalComments(prevComments => 
        prevComments.map(comment => 
          comment.id === commentId 
            ? { 
                ...comment, 
                isLiked: !comment.isLiked,
                likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1
              }
            : comment
        )
      );
    }
  };

  const handleAddComment = () => {
    if (commentText.trim()) {
      const comment = {
        id: Date.now(),
        username: currentUser,
        text: commentText.trim(),
        time: "maintenant",
        likes: 0,
        isLiked: false,
        replies: []
      };
      setLocalComments(prev => [...prev, comment]);
      setCommentText("");
    }
  };

  const handleAddReply = (commentId) => {
    if (replyText.trim()) {
      const reply = {
        id: Date.now(),
        username: currentUser,
        text: replyText.trim(),
        time: "maintenant",
        likes: 0,
        isLiked: false
      };
      
      setLocalComments(prevComments => 
        prevComments.map(comment => 
          comment.id === commentId 
            ? { ...comment, replies: [...(comment.replies || []), reply] }
            : comment
        )
      );
      
      setReplyText("");
      setReplyingTo(null);
    }
  };

  const handleDeleteComment = (commentId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce commentaire ?")) {
      setLocalComments(prev => prev.filter(comment => comment.id !== commentId));
    }
  };

  const handleDeleteReply = (commentId, replyId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette réponse ?")) {
      setLocalComments(prevComments => 
        prevComments.map(comment => 
          comment.id === commentId 
            ? { 
                ...comment, 
                replies: comment.replies.filter(reply => reply.id !== replyId) 
              }
            : comment
        )
      );
    }
  };

  const handleDeletePost = () => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce flash ?")) {
      console.log("Suppression du flash");
      setShowMenu(false);
    }
  };

  const handleReportPost = () => {
    alert("Flash signalé aux modérateurs");
    setShowMenu(false);
  };

  // Fermer le menu si on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <article className="mb-6 border-b border-gray-700">
        {/* En-tête avec profil artiste */}
        <div className="flex items-center p-4">
          <div className="w-10 h-10 rounded-full bg-red-400 flex items-center justify-center text-white font-bold mr-3">
            TA
          </div>
          <div className="flex-1">
            <div className="font-bold">TattooArtist</div>
            <div className="text-xs text-gray-500 flex items-center">
              <MapPin size={12} className="mr-1" />
              Paris, France
            </div>
          </div>
          <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-full text-sm font-medium transition-colors mr-3">
            Suivre
          </button>
          <div className="relative" ref={menuRef}>
            <button 
              className="text-xl text-gray-500 hover:text-white transition-colors p-1"
              onClick={() => setShowMenu(!showMenu)}
            >
              <MoreVertical size={20} />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 top-8 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-10 min-w-48">
                {isOwnPost ? (
                  <button
                    onClick={handleDeletePost}
                    className="w-full px-4 py-3 text-left hover:bg-gray-700 flex items-center gap-3 text-red-400 hover:text-red-300"
                  >
                    <Trash2 size={16} />
                    Supprimer
                  </button>
                ) : (
                  <button
                    onClick={handleReportPost}
                    className="w-full px-4 py-3 text-left hover:bg-gray-700 flex items-center gap-3 text-yellow-400 hover:text-yellow-300"
                  >
                    <Flag size={16} />
                    Signaler
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Image du flash */}
        <div className="relative w-full aspect-square bg-gray-700">
          <img
            src="/api/placeholder/400/400"
            alt="Flash de tatouage"
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full flex items-center shadow-md">
            <Star size={14} className="mr-1 fill-white" />
            <span className="text-sm font-medium">Flash exclusif</span>
          </div>
        </div>

        {/* Barre d'actions */}
        <div className="flex items-center p-4">
          <button className="mr-4 text-xl hover:scale-110 transition-transform" onClick={handleLike}>
            <Heart 
              fill={isLiked ? "#ef4444" : "none"} 
              color={isLiked ? "#ef4444" : "currentColor"} 
            />
          </button>
          <button 
            className="mr-4 text-xl hover:scale-110 transition-transform"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle />
          </button>
          <button className="mr-4 text-xl hover:scale-110 transition-transform">
            <Share />
          </button>
          <button className="ml-auto text-xl hover:scale-110 transition-transform" onClick={handleSave}>
            <Bookmark fill={isSaved ? "#ef4444" : "none"} color={isSaved ? "#ef4444" : "currentColor"} />
          </button>
        </div>

        {/* Stats */}
        <div className="px-4 mb-1 text-sm font-bold">{likes} j'aime</div>
        <div className="px-4 flex items-center text-sm text-gray-500 mb-2">
          <Eye size={16} className="mr-1" />
          <span>753 vues</span>
        </div>

        {/* Titre et description */}
        <div className="px-4 text-sm leading-relaxed mb-4">
          <span className="font-bold">Rose Old School</span> - 150 €
          <br />
          Une rose traditionnelle old school aux couleurs vives. Design original parfait pour l'avant-bras ou le mollet. Je peux adapter légèrement la taille selon vos besoins. Session de tatouage estimée à 2-3 heures.
        </div>

        {/* Informations techniques compactes */}
        <div className="px-4 mb-4">
          <div className="flex flex-wrap gap-2 text-xs">
            <div className="bg-gray-800 px-2 py-1 rounded">Moyen (10-15cm)</div>
            <div className="bg-gray-800 px-2 py-1 rounded">Avant-bras</div>
            <div className="bg-gray-800 px-2 py-1 rounded">Polychrome</div>
            <div className="bg-gray-800 px-2 py-1 rounded">2-3 heures</div>
          </div>
        </div>

        {/* Tags */}
        <div className="px-4 mb-4">
          <div className="flex flex-wrap gap-2">
            {["#OldSchool", "#Rose", "#Traditionnel", "#Floral"].map((tag, index) => (
              <span key={index} className="text-blue-400 text-sm">{tag}</span>
            ))}
          </div>
        </div>

        {/* Disponibilité */}
        <div className="px-4 mb-4">
          <div className="flex items-center text-sm">
            <Circle size={12} className="text-green-500 fill-green-500 mr-2" />
            <span className="font-medium text-green-500">Disponible</span>
            <span className="text-gray-500 ml-2">(Pièce unique)</span>
          </div>
        </div>

        {/* Bouton de commentaires */}
        <button 
          className="px-4 pb-4 text-sm text-gray-500 hover:text-gray-300 transition-colors"
          onClick={() => setShowComments(!showComments)}
        >
          Voir les {localComments.reduce((total, comment) => total + 1 + (comment.replies?.length || 0), 0)} commentaires
        </button>

        {/* Section commentaires */}
        {showComments && (
          <div className="border-t border-gray-700 bg-gray-800/50">
            {/* Zone des commentaires */}
            <div className="max-h-80 overflow-y-auto">
              {localComments.map((comment) => (
                <div key={comment.id} className="border-b border-gray-700/50">
                  {/* Commentaire principal */}
                  <div className="flex items-start p-4">
                    <div className="w-8 h-8 rounded-full bg-gray-600 mr-3 flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="text-sm">
                        <span className="font-bold mr-2">{comment.username}</span>
                        {comment.text}
                      </div>
                      <div className="flex items-center mt-1 text-xs text-gray-500 gap-4">
                        <span>{comment.time}</span>
                        <span>{comment.likes} j'aime</span>
                        <button 
                          onClick={() => handleCommentLike(comment.id)}
                          className={`hover:text-red-400 transition-colors ${
                            comment.isLiked ? 'text-red-400' : ''
                          }`}
                        >
                          J'aime
                        </button>
                        <button 
                          onClick={() => setReplyingTo(comment.id)}
                          className="hover:text-blue-400 transition-colors"
                        >
                          Répondre
                        </button>
                        {comment.username === currentUser && (
                          <button 
                            onClick={() => handleDeleteComment(comment.id)}
                            className="hover:text-red-400 transition-colors"
                          >
                            Supprimer
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Réponses */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="ml-11 border-l border-gray-700 pl-4">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="flex items-start py-3">
                          <div className="w-6 h-6 rounded-full bg-gray-600 mr-3 flex-shrink-0"></div>
                          <div className="flex-1">
                            <div className="text-sm">
                              <span className="font-bold mr-2">{reply.username}</span>
                              {reply.text}
                            </div>
                            <div className="flex items-center mt-1 text-xs text-gray-500 gap-4">
                              <span>{reply.time}</span>
                              <span>{reply.likes} j'aime</span>
                              <button 
                                onClick={() => handleCommentLike(reply.id, true, comment.id)}
                                className={`hover:text-red-400 transition-colors ${
                                  reply.isLiked ? 'text-red-400' : ''
                                }`}
                              >
                                J'aime
                              </button>
                              {reply.username === currentUser && (
                                <button 
                                  onClick={() => handleDeleteReply(comment.id, reply.id)}
                                  className="hover:text-red-400 transition-colors"
                                >
                                  Supprimer
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Zone de réponse */}
                  {replyingTo === comment.id && (
                    <div className="ml-11 p-4 border-t border-gray-700/50">
                      <div className="flex items-center">
                        <div className="w-6 h-6 rounded-full bg-gray-600 mr-3"></div>
                        <input
                          type="text"
                          placeholder={`Répondre à ${comment.username}...`}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleAddReply(comment.id)}
                          className="flex-1 bg-transparent border-none outline-none text-sm placeholder-gray-500"
                          autoFocus
                        />
                        <button
                          onClick={() => setReplyingTo(null)}
                          className="ml-2 text-gray-500 hover:text-white transition-colors"
                        >
                          <X size={16} />
                        </button>
                        {replyText.trim() && (
                          <button
                            onClick={() => handleAddReply(comment.id)}
                            className="ml-2 text-blue-400 hover:text-blue-300 font-semibold text-sm"
                          >
                            Publier
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Zone d'ajout de commentaire */}
            <div className="flex items-center p-4 border-t border-gray-700">
              <div className="w-8 h-8 rounded-full bg-gray-600 mr-3"></div>
              <input
                type="text"
                placeholder="Ajouter un commentaire..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                className="flex-1 bg-transparent border-none outline-none text-sm placeholder-gray-500"
              />
              {commentText.trim() && (
                <button
                  onClick={handleAddComment}
                  className="ml-2 text-blue-400 hover:text-blue-300 font-semibold text-sm"
                >
                  Publier
                </button>
              )}
            </div>

            {/* Bouton fermer */}
            <div className="flex justify-center p-2">
              <button
                onClick={() => setShowComments(false)}
                className="text-gray-500 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Bouton de réservation */}
        <div className="p-4 border-t border-gray-700">
          <button className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-bold text-lg transition-colors">
            Réserver ce flash - 150 €
          </button>
        </div>
      </article>
    </div>
  );
}