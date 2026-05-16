import React, { useState } from "react";
import { format } from "date-fns";
import { TbChecks } from "react-icons/tb";
import { BsReply, BsEmojiSmile } from "react-icons/bs";

const MessageBubble = ({
  message,
  theme,
  currentUser,
  onReact,
  onReply,
}) => {
  const [showActions, setShowActions] = useState(false);
  const [showReactions, setShowReactions] = useState(false);

  if (!message) return null;

  const isMyMessage = message.sender?._id === currentUser?._id || message.senderId === currentUser?._id;
  const time = message.createdAt ? format(new Date(message.createdAt), "HH:mm") : "";

  const quickReactions = ["❤️", "👍", "😂", "😮", "😢", "🙏"];

  const handleReaction = (emoji) => {
    if (onReact) {
      onReact(message._id || message.tempId, emoji);
    }
    setShowReactions(false);
  };

  const handleReply = () => {
    if (onReply) {
      onReply(message);
    }
    setShowActions(false);
  };

  // Get reaction counts
  const reactionCounts = {};
  if (message.reactions && message.reactions.length > 0) {
    message.reactions.forEach(r => {
      reactionCounts[r.emoji] = (reactionCounts[r.emoji] || 0) + 1;
    });
  }

  return (
    <div
      className={`flex mb-4 group relative ${
        isMyMessage ? "justify-end" : "justify-start"
      }`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => {
        setShowActions(false);
        setShowReactions(false);
      }}
    >
      <div className="relative max-w-[70%]">
        {/* Reply Preview */}
        {message.replyTo && (
          <div className={`mb-1 px-3 py-1 rounded-t-lg text-xs border-l-4 ${
            isMyMessage 
              ? "bg-yellow-600 border-yellow-300" 
              : theme === "dark" 
                ? "bg-gray-600 border-gray-400" 
                : "bg-gray-100 border-gray-400"
          }`}>
            <div className="font-semibold opacity-90">
              {message.replyTo.sender?.username || "User"}
            </div>
            <div className="opacity-75 truncate">
              {message.replyTo.content || "Media"}
            </div>
          </div>
        )}

        {/* Message Content */}
        <div
          className={`px-4 py-2 rounded-lg shadow-md relative ${
            message.replyTo ? "rounded-tl-none" : ""
          } ${
            isMyMessage
              ? "bg-yellow-500 text-white rounded-br-none"
              : theme === "dark" 
                  ? "bg-gray-700 text-white rounded-bl-none"
                  : "bg-white text-gray-800 rounded-bl-none"
          }`}
        >
          {/* Image/Video */}
          {message.imageOrVideoUrl && (
            <div className="mb-2">
              {message.contentType === "image" ? (
                <img 
                  src={message.imageOrVideoUrl} 
                  alt="shared" 
                  className="rounded max-w-full max-h-64 object-cover"
                />
              ) : (
                <video 
                  src={message.imageOrVideoUrl} 
                  controls 
                  className="rounded max-w-full max-h-64"
                />
              )}
            </div>
          )}

          {/* Text Content */}
          {message.content && (
            <p className="mb-4 text-sm whitespace-pre-wrap leading-relaxed">
              {message.content || message.text}
            </p>
          )}
          
          {/* Time & Status */}
          <div className="flex items-center justify-end gap-1 absolute bottom-1 right-2">
            <span className={`text-[10px] ${isMyMessage ? "text-yellow-100" : "text-gray-400"}`}>
              {time}
            </span>
            {isMyMessage && (
              <TbChecks className={`w-4 h-4 ${message.messageStatus === "read" ? "text-blue-200" : "text-yellow-100"}`} />
            )}
          </div>
        </div>

        {/* Reactions Display */}
        {Object.keys(reactionCounts).length > 0 && (
          <div className={`flex gap-1 mt-1 flex-wrap ${isMyMessage ? "justify-end" : "justify-start"}`}>
            {Object.entries(reactionCounts).map(([emoji, count]) => (
              <span 
                key={emoji}
                className={`text-xs px-2 py-0.5 rounded-full ${
                  theme === "dark" ? "bg-gray-600" : "bg-gray-200"
                }`}
              >
                {emoji} {count > 1 && count}
              </span>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        {showActions && (
          <div className={`absolute top-0 ${isMyMessage ? "left-0 -translate-x-full" : "right-0 translate-x-full"} flex gap-1 px-2`}>
            <button
              onClick={() => setShowReactions(!showReactions)}
              className={`p-1.5 rounded-full ${
                theme === "dark" ? "bg-gray-600 hover:bg-gray-500" : "bg-gray-200 hover:bg-gray-300"
              }`}
              title="React"
            >
              <BsEmojiSmile className="w-4 h-4" />
            </button>
            <button
              onClick={handleReply}
              className={`p-1.5 rounded-full ${
                theme === "dark" ? "bg-gray-600 hover:bg-gray-500" : "bg-gray-200 hover:bg-gray-300"
              }`}
              title="Reply"
            >
              <BsReply className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Reaction Picker */}
        {showReactions && (
          <div className={`absolute ${isMyMessage ? "left-0 -translate-x-full" : "right-0 translate-x-full"} top-8 flex gap-1 p-2 rounded-lg shadow-lg ${
            theme === "dark" ? "bg-gray-700" : "bg-white"
          }`}>
            {quickReactions.map(emoji => (
              <button
                key={emoji}
                onClick={() => handleReaction(emoji)}
                className="text-2xl hover:scale-125 transition-transform"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;