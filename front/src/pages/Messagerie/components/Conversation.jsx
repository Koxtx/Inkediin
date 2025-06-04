import React, { useContext, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  MoreVertical, 
  Plus, 
  Send, 
  Smile, 
  Edit3, 
  Trash2, 
  Image,
  Paperclip,
  Camera
} from 'lucide-react';
import { MessagerieContext } from '../../../context/MessagerieContext';

export default function Conversation() {
  const { id } = useParams();
  const { 
    conversations, 
    newMessage, 
    setNewMessage, 
    activeConversation, 
    setActiveConversation,
    sendMessage,
    markAsRead,
    deleteMessage,
    editMessage
  } = useContext(MessagerieContext);
  
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingContent, setEditingContent] = useState('');
  const [messageMenuId, setMessageMenuId] = useState(null);
  
  useEffect(() => {
    if (id && id !== activeConversation) {
      setActiveConversation(id);
      markAsRead(id);
    }
  }, [id, activeConversation, setActiveConversation, markAsRead]);
  
  if (!activeConversation || !conversations[activeConversation]) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-400 mb-4">Conversation non trouvée</p>
        <Link 
          to="/messagerie" 
          className="px-4 py-2 bg-red-400 text-white rounded-lg hover:bg-red-500 transition-colors flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Retour à la messagerie
        </Link>
      </div>
    );
  }
  
  const { contactInfo, messages } = conversations[activeConversation];

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      sendMessage(activeConversation, newMessage);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleEditMessage = (messageId, content) => {
    setEditingMessageId(messageId);
    setEditingContent(content);
    setMessageMenuId(null);
  };

  const handleSaveEdit = (messageId) => {
    if (editingContent.trim()) {
      editMessage(activeConversation, messageId, editingContent);
    }
    setEditingMessageId(null);
    setEditingContent('');
  };

  const handleDeleteMessage = (messageId) => {
    deleteMessage(activeConversation, messageId);
    setMessageMenuId(null);
  };

  const handleAttachmentAction = (type) => {
    console.log(`Action d'attachement: ${type}`);
    setShowAttachmentMenu(false);
    // Ici vous pouvez implémenter la logique pour chaque type d'attachement
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-md px-4 py-3 flex items-center relative">
        <Link to="/messagerie" className="text-gray-600 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 mr-4">
          <ArrowLeft size={20} />
        </Link>
        <div className="w-10 h-10 rounded-full bg-red-400 text-white flex items-center justify-center font-medium">
          {contactInfo.initials}
        </div>
        <div className="ml-3 flex-grow">
          <div className="font-semibold text-gray-900 dark:text-white">{contactInfo.name}</div>
          <div className="text-xs text-green-500">{contactInfo.status}</div>
        </div>
        <div className="relative">
          <button
            className="text-gray-600 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 cursor-pointer p-1"
            onClick={() => setShowOptionsMenu(!showOptionsMenu)}
          >
            <MoreVertical size={20} />
          </button>
          
          {/* Menu d'options de conversation */}
          {showOptionsMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 z-10">
              <div className="py-2">
                <button className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2">
                  <Edit3 size={16} />
                  Modifier le contact
                </button>
                <button className="w-full px-4 py-2 text-left text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2">
                  <Trash2 size={16} />
                  Supprimer la conversation
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Messages container */}
      <div className="flex-grow overflow-y-auto px-4 py-6">
        <div className="text-center mb-6">
          <span className="inline-block px-3 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
            Aujourd'hui
          </span>
        </div>

        {messages.map((message, index) => (
          <div key={message.id || index} className="relative group">
            {message.isProduct ? (
              <div className={`flex justify-${message.sent ? 'end' : 'start'} mb-4`}>
                <div className="max-w-xs sm:max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                  <div className="h-40 bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                    <Image size={24} className="text-gray-500 dark:text-gray-400" />
                  </div>
                  <div className="p-3 flex justify-between items-center">
                    <div className="text-gray-900 dark:text-white font-medium">{message.title}</div>
                    <div className="text-red-500 font-bold">{message.price}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className={`flex ${message.sent ? 'justify-end' : 'justify-start'} mb-4 relative`}>
                <div className="relative max-w-xs sm:max-w-md">
                  {editingMessageId === (message.id || index) ? (
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-2 border-2 border-red-400">
                      <textarea
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded resize-none dark:bg-gray-700 dark:text-white"
                        value={editingContent}
                        onChange={(e) => setEditingContent(e.target.value)}
                        rows="2"
                      />
                      <div className="flex justify-end gap-2 mt-2">
                        <button
                          className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded"
                          onClick={() => setEditingMessageId(null)}
                        >
                          Annuler
                        </button>
                        <button
                          className="px-3 py-1 text-sm bg-red-400 text-white rounded"
                          onClick={() => handleSaveEdit(message.id || index)}
                        >
                          Sauvegarder
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className={`px-4 py-2 rounded-lg ${
                        message.sent 
                          ? 'bg-red-400 text-white' 
                          : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                      }`}>
                        {message.content}
                      </div>
                      <span className={`text-xs text-gray-500 ${message.sent ? 'text-right' : 'text-left'} block mt-1`}>
                        {message.time}
                      </span>
                      
                      {/* Menu contextuel pour les messages */}
                      {message.sent && (
                        <div className="absolute -right-8 top-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            onClick={() => setMessageMenuId(messageMenuId === (message.id || index) ? null : (message.id || index))}
                          >
                            <MoreVertical size={16} />
                          </button>
                          
                          {messageMenuId === (message.id || index) && (
                            <div className="absolute right-0 top-full mt-1 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 z-10">
                              <div className="py-1">
                                <button
                                  className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                                  onClick={() => handleEditMessage(message.id || index, message.content)}
                                >
                                  <Edit3 size={12} />
                                  Modifier
                                </button>
                                <button
                                  className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                                  onClick={() => handleDeleteMessage(message.id || index)}
                                >
                                  <Trash2 size={12} />
                                  Supprimer
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input area */}
      <div className="bg-white dark:bg-gray-800 px-4 py-3 shadow-inner flex items-center relative">
        <div className="relative">
          <button 
            className="text-gray-600 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 mr-3 p-1"
            onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
          >
            <Plus size={20} />
          </button>
          
          {/* Menu d'attachements */}
          {showAttachmentMenu && (
            <div className="absolute bottom-full left-0 mb-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 z-10">
              <div className="py-2">
                <button
                  className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  onClick={() => handleAttachmentAction('photo')}
                >
                  <Camera size={16} />
                  Photo
                </button>
                <button
                  className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  onClick={() => handleAttachmentAction('file')}
                >
                  <Paperclip size={16} />
                  Fichier
                </button>
                <button
                  className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  onClick={() => handleAttachmentAction('image')}
                >
                  <Image size={16} />
                  Image
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex-grow relative">
          <textarea
            className="w-full border border-gray-300 dark:border-gray-600 rounded-full py-2 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-300 transition-colors resize-none dark:bg-gray-700 dark:text-white"
            placeholder="Écrivez un message..."
            rows="1"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-red-500">
            <Smile size={16} />
          </button>
        </div>
        <button 
          className="ml-3 text-gray-600 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 p-1"
          onClick={handleSendMessage}
        >
          <Send size={20} />
        </button>
      </div>
      
      {/* Overlay pour fermer les menus */}
      {(showOptionsMenu || showAttachmentMenu || messageMenuId) && (
        <div 
          className="fixed inset-0 z-5" 
          onClick={() => {
            setShowOptionsMenu(false);
            setShowAttachmentMenu(false);
            setMessageMenuId(null);
          }}
        />
      )}
    </div>
  );
}