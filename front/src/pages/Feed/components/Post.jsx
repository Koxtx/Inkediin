import React, { useContext, useState, useRef, useEffect } from "react";
import { Bookmark, Heart, MessageCircle, Share, MoreVertical, Flag, Trash2, X } from "lucide-react";
import { FlashContext } from "../../../context/FlashContext";

export default function Post({ 
  id, 
  username, 
  time, 
  likes, 
  caption, 
  comments, 
  isLiked, 
  isSaved, 
  isOwnPost = false,
  commentsData = [],
  currentUser = "current_user"
}) {
  const { toggleLikePost } = useContext(FlashContext);
  const [showMenu, setShowMenu] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [localComments, setLocalComments] = useState(commentsData);
  const [localLikes, setLocalLikes] = useState(likes);
  const [localIsLiked, setLocalIsLiked] = useState(isLiked);
  const menuRef = useRef(null);
  
  const handleLike = () => {
    const wasLiked = localIsLiked;
    setLocalIsLiked(!wasLiked);
    setLocalLikes(prevLikes => wasLiked ? prevLikes - 1 : prevLikes + 1);
    toggleLikePost && toggleLikePost(id);
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
    if (newComment.trim()) {
      const comment = {
        id: Date.now(),
        username: currentUser,
        text: newComment.trim(),
        time: "maintenant",
        likes: 0,
        isLiked: false,
        replies: []
      };
      setLocalComments(prev => [...prev, comment]);
      setNewComment("");
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
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce post ?")) {
      // Logique de suppression du post
      console.log("Suppression du post", id);
      setShowMenu(false);
    }
  };

  const handleReportPost = () => {
    alert("Post signalé aux modérateurs");
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
    <article className="mb-6 border-b border-gray-700">
      <div className="flex items-center p-4">
        <div className="w-10 h-10 rounded-full bg-gray-600 mr-3"></div>
        <div className="flex-1">
          <div className="font-bold">{username}</div>
          <div className="text-xs text-gray-500">{time}</div>
        </div>
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

      <div className="w-full aspect-square bg-gray-700"></div>

      <div className="flex items-center p-4">
        <button className="mr-4 text-xl hover:scale-110 transition-transform" onClick={handleLike}>
          <Heart 
            fill={localIsLiked ? "#ef4444" : "none"} 
            color={localIsLiked ? "#ef4444" : "currentColor"} 
          />
        </button>
        <button 
          className="mr-4 text-xl hover:scale-110 transition-transform"
          onClick={() => setShowComments(!showComments)}
        >
          <MessageCircle />
        </button>
        <button className="ml-auto text-xl hover:scale-110 transition-transform">
          <Bookmark fill={isSaved ? "#ef4444" : "none"} color={isSaved ? "#ef4444" : "currentColor"} />
        </button>
      </div>

      <div className="px-4 mb-1 text-sm font-bold">{localLikes} j'aime</div>

      <div className="px-4 text-sm leading-relaxed">
        <span className="font-bold">{username}</span> {caption}
      </div>

      <button 
        className="p-4 text-sm text-gray-500 hover:text-gray-300 transition-colors"
        onClick={() => setShowComments(!showComments)}
      >
        Voir les {localComments.reduce((total, comment) => total + 1 + (comment.replies?.length || 0), 0)} commentaires
      </button>

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
                      {(comment.username === currentUser || isOwnPost) && (
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
                            {(reply.username === currentUser || isOwnPost) && (
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
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
              className="flex-1 bg-transparent border-none outline-none text-sm placeholder-gray-500"
            />
            {newComment.trim() && (
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
    </article>
  );
}