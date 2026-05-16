import React, {
  useEffect,
  useRef,
  useState,
} from "react";
import useThemeStore from "../../store/themeStore";
import useUserStore from "../../store/useUserStore";
import { useChatStore } from "../../store/chatStore";
import { isToday, isYesterday, format } from "date-fns";
import whatsappImage from "../../images/whatsapp_image.png";
import { FaArrowLeft, FaEllipsisV, FaLock, FaVideo, FaPaperPlane, FaSmile, FaMicrophone, FaPlus, FaTimes, FaImage, FaPaperclip } from "react-icons/fa";
//import * as Yup from "yup";
import MessageBubble from "./MessageBubble";
import EmojiPicker from "emoji-picker-react";

const isValidate = (date) => {
  return date instanceof Date && !isNaN(date);
};
//const ChatWindow = (selectedContact, setSelectedContact) => {
const ChatWindow = ({ selectedContact, setSelectedContact }) => {
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setEmojiPicker] = useState(false);
  const [showFileMenu, setShowFileMenu] = useState(false);
  const [filePreview, setFilePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const typingTimoutRef = useRef(null);
  const messageEndRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const fileInputRef = useRef(null);

  const { theme } = useThemeStore();
  const { user } = useUserStore();

  const {
    messages,
    loading,
    sendMessage,
    receiveMessage,
    fetchMessages,
    fetchConversations,
    conversations,
    isUserTyping,
    startTyping,
    stopTyping,
    getUserLastSeen,
    isUserOnline,
    deleteMessage,
    addReaction,
    cleanup,
  } = useChatStore();

  // get online status and last seen
  const online = isUserOnline(selectedContact?._id);
  const lastSeen = getUserLastSeen(selectedContact?._id);
  const isTyping = isUserTyping(selectedContact?._id);



  useEffect(() => {
    if (selectedContact?._id && conversations?.data?.length > 0) {
      const conversation = conversations?.data?.find((conv) =>
        conv.participants.some(
          (participants) => participants._id === selectedContact?._id
        )
      );
      if (conversation?._id) {
        setCurrentConversationId(conversation._id);
        fetchMessages(conversation._id);
      } else {
        // No existing conversation - this is a new chat
        setCurrentConversationId(null);
        // Messages will be empty until first message is sent
      }
    } else {
      setCurrentConversationId(null);
    }
  }, [selectedContact, conversations, fetchMessages]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: "auto" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (message && selectedContact) {
      startTyping(selectedContact?._id);

      if (typingTimoutRef.current) {
        clearTimeout(typingTimoutRef.current);
      }

      typingTimoutRef.current = setTimeout(() => {
        stopTyping(selectedContact?._id);
      }, 2000);
    }
    return () => {
      if (typingTimoutRef.current) {
        clearTimeout(typingTimoutRef.current);
      }
    };
  }, [message, selectedContact, startTyping, stopTyping]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setShowFileMenu(false);
      if (file.type.startsWith("image/")) {
        setFilePreview(URL.createObjectURL(file));
      }
    }
  };

  const onEmojiClick = (emojiObject) => {
    setMessage((prevMessage) => prevMessage + emojiObject.emoji);
    setEmojiPicker(false);
  };

  const handleSendMessage = async () => {
    if (!selectedContact) return;
    if (!message.trim() && !selectedFile) return;
    
    try {
      const formData = new FormData();
      formData.append("senderId", user?._id);
      formData.append("receiverId", selectedContact?._id);
      formData.append("messageStatus", online ? "delivered" : "send");
      
      if (message.trim()) {
        formData.append("content", message.trim());
      }
      
      if (selectedFile) {
        formData.append("media", selectedFile, selectedFile.name);
      }
      
      if (replyingTo) {
        formData.append("replyTo", replyingTo._id);
      }
      
      await sendMessage(formData);

      //clear state
      setMessage("");
      setFilePreview(null);
      setSelectedFile(null);
      setShowFileMenu(false);
      setReplyingTo(null);
    } catch (error) {
      console.error("failed to send message", error);
    }
  };

  const renderDateSeparator = (date) => {
    if (!isValidate(date)) {
      return null;
    }
    let dateString;
    if (isToday(date)) {
      dateString = "Today";
    } else if (isYesterday(date)) {
      dateString = "Yesterday";
    } else {
      dateString = format(date, "EEEE,MMMM,d");
    }

    return (
      <div className="flex justify-center my-4">
        <span
          className={`px-4 py-2 rounded-full text-sm ${
            theme === "dark"
              ? "bg-gray-700 text-gray-300"
              : "bg-gray-200 text-gray-600"
          }`}
        >
          {dateString}
        </span>
      </div>
    );
  };
  //grop message
  const groupedMessages = Array.isArray(messages)
    ? messages.reduce((acc, message) => {
        if (!message.createdAt) return acc;

        const date = new Date(message.createdAt);
        if (isValidate(date)) {
          const dateString = format(date, "yyyy-MM-dd");
          if (!acc[dateString]) acc[dateString] = [];
          acc[dateString].push(message);
        }
        return acc;
      }, {})
    : {};

  const handleReaction = (messageId, emoji) => {
    addReaction(messageId, emoji);
  };

  const handleReply = (message) => {
    setReplyingTo(message);
  };

  //console.log("this is my contact", selectedContact);

  if (!selectedContact) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center mx-auto h-screen text-center">
        <div className="max-w-md">
          <img src={whatsappImage} alt="chat-app" className="w-full h-auto" />
          <h2
            className={`text-3xl font-semibold mb-4 ${
              theme === "dark" ? "text-white" : "text-black"
            }`}
          >
            Select a conversation to start chatting
          </h2>
          <p
            className={` ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            } mb-6`}
          >
            Choose a contact from the list on the left to begain messaging
          </p>

          <p
            className={` ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            } text-sm mt-8 flex item-center justify-center gap-2`}
          >
            <FaLock className="h-4 w-4" />
            Your personal message are end-to-end encrypted
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex-1 h-screen w-full flex flex-col">
      <div
        className={`p-4 ${
          theme === "dark"
            ? "bg-[#303430] text-white"
            : "bg-[rgb(239,242,245)] text-gray-600"
        } flex items-center`}
      >
        <button
          className="mr-2 focus:outline-none"
          onClick={() => setSelectedContact(null)}
        >
          <FaArrowLeft className="h-6 w-6" />
        </button>

        <img
          src={selectedContact?.profilePicture}
          alt={selectedContact?.username}
          className="w-10 h-10 rounded-full"
        />

        <div className="ml-3 flex-grow">
          <h2 className="font-semibold text-start">
            {selectedContact?.username}
          </h2>

          {isTyping ? (
            <div>Typing....</div>
          ) : (
            <p
              className={`text-sm ${
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {online
                ? "Online"
                : lastSeen
                ? `Last seen ${format(new Date(lastSeen), "HH:mm")}`
                : "Offline"}
            </p>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <button className="focus:outline-none">
            <FaVideo className="h-5 w-5" />
          </button>
          <button className="focus:outline-none">
            <FaEllipsisV className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div
        className={`flex-1 p-4 overflow-y-auto ${
          theme === "dark" ? "bg-[#191a1a]" : "bg-[rgb(241,236,229)]"
        }`}
      >
        {Object.entries(groupedMessages).map(([date, msgs]) => (
          <React.Fragment key={date}>
            {renderDateSeparator(new Date(date))}
            {msgs
              .filter((msg) => {
                // Only show messages that match the current conversation
                // Don't show any messages if there's no conversation ID
                if (!currentConversationId) return false;
                return msg.conversation === currentConversationId;
              })
              .map((msg) => (
                <MessageBubble
                  key={msg._id || msg.tempId}
                  message={msg}
                  theme={theme}
                  currentUser={user}
                  onReact={handleReaction}
                  onReply={handleReply}
                  deleteMessage={deleteMessage}
                />
              ))}
          </React.Fragment>
        ))}
        <div ref={messageEndRef} />
      </div>

      {/* Reply Preview */}
      {replyingTo && (
        <div className={`px-4 py-2 border-t ${theme === "dark" ? "bg-[#202c33] border-gray-700" : "bg-gray-100 border-gray-200"} flex items-center justify-between`}>
          <div className="flex-1">
            <div className="text-xs font-semibold text-yellow-500">
              Replying to {replyingTo.sender?.username || "User"}
            </div>
            <div className="text-sm truncate opacity-75">
              {replyingTo.content || "Media"}
            </div>
          </div>
          <button
            onClick={() => setReplyingTo(null)}
            className="ml-2 text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
      )}

      {/* File Preview */}
      {filePreview && (
        <div className={`p-4 ${theme === "dark" ? "bg-[#202c33]" : "bg-gray-100"} border-t ${theme === "dark" ? "border-gray-700" : "border-gray-200"}`}>
          <div className="relative inline-block">
            <img 
              src={filePreview} 
              alt="preview" 
              className="max-w-xs max-h-64 object-cover rounded-lg shadow-lg" 
            />
            <button
              onClick={() => {
                setFilePreview(null);
                setSelectedFile(null);
              }}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 shadow-lg"
              title="Remove image"
            >
              <FaTimes size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className={`p-3 ${theme === "dark" ? "bg-[#202c33]" : "bg-[#f0f2f5]"} flex items-center space-x-2`}>
        <div className="relative">
          <button
            onClick={() => setShowFileMenu(!showFileMenu)}
            className={`p-2 rounded-full transition-colors ${theme === "dark" ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"}`}
          >
            <FaPlus />
          </button>
          {showFileMenu && (
            <div className={`absolute bottom-12 left-0 w-40 rounded-lg shadow-xl p-2 z-50 ${theme === "dark" ? "bg-[#2a3942]" : "bg-white"}`}>
              <label className="flex items-center space-x-3 p-2 hover:bg-opacity-10 cursor-pointer rounded hover:bg-gray-500">
                <FaImage className="text-purple-500" />
                <span className={theme === "dark" ? "text-white" : "text-gray-700"}>Photos & Videos</span>
                <input type="file" accept="image/*,video/*" multiple={false} hidden onChange={handleFileChange} ref={fileInputRef} />
              </label>
            </div>
          )}
        </div>

        <div className={`flex-1 flex items-center rounded-lg px-4 py-2 ${theme === "dark" ? "bg-[#2a3942]" : "bg-white"} relative`}>
          <button 
            onClick={() => setEmojiPicker(!showEmojiPicker)} 
            className={`mr-2 ${theme === "dark" ? "text-gray-400" : "text-gray-500"} focus:outline-none`}
          >
            <FaSmile className="w-6 h-6" />
          </button>
          
          {showEmojiPicker && (
            <div ref={emojiPickerRef} className="absolute left-0 bottom-16 z-50">
              <EmojiPicker onEmojiClick={onEmojiClick} theme={theme === "dark" ? "dark" : "light"} />
            </div>
          )}
          
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message"
            className={`flex-1 bg-transparent border-none focus:ring-0 text-md focus:outline-none ${theme === "dark" ? "text-white placeholder-gray-400" : "text-gray-800 placeholder-gray-500"}`}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          />
        </div>

        {message.trim() || selectedFile ? (
          <button onClick={handleSendMessage} className="p-3 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 transition-colors shadow-lg">
            <FaPaperPlane />
          </button>
        ) : (
          <button className={`p-3 rounded-full ${theme === "dark" ? "text-gray-400 hover:bg-gray-700" : "text-gray-500 hover:bg-gray-200"}`}>
            <FaMicrophone />
          </button>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;
