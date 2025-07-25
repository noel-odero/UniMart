import { useState, useRef, useEffect } from "react";
import { Send, ArrowLeft, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useGetMessages, useSendMessage, type Conversation} from "@/features/conversations"; //, type Message 
import { formatTimestamp } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";

interface ConversationDetailProps {
  conversation: Conversation;
  onBack: () => void;
}

export default function ConversationDetail({ conversation, onBack }: ConversationDetailProps) {
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  // Get messages for this conversation
  const { data: messagesData, isLoading } = useGetMessages(conversation._id);
  const messages = messagesData?.messages || [];

  // Send message mutation
  const sendMessageMutation = useSendMessage();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    sendMessageMutation.mutate({
      recipientId: conversation.participants.find(p => p._id !== user?.id)?._id || "",
      listingId: conversation.listing._id,
      content: message.trim(),
    });

    setMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const otherParticipant = conversation.participants.find(p => p._id !== user?.id);

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-tan-50 via-brown-50 to-tan-100">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm border-b border-brown-200/50">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-brown-700 hover:bg-brown-100"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <Avatar className="w-10 h-10">
            <AvatarImage src={otherParticipant?.avatar} />
            <AvatarFallback className="bg-brown-200 text-brown-700">
              {otherParticipant?.fullName.split(" ").map(n => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-brown-800">{otherParticipant?.fullName}</h3>
            <p className="text-xs text-brown-600">{otherParticipant?.university}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="text-brown-700 hover:bg-brown-100">
          <MoreVertical className="w-4 h-4" />
        </Button>
      </div>

      {/* Listing Info */}
      <div className="px-4 py-3 bg-brown-50/50 border-b border-brown-200/30">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-brown-200 rounded-lg flex items-center justify-center">
            <span className="text-brown-600 font-medium text-sm">
              {conversation.listing.category.charAt(0)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-brown-800 truncate">
              {conversation.listing.title}
            </p>
            <p className="text-xs text-brown-600">RWF {conversation.listing.price}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-brown-600">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-brown-500">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwnMessage = msg.sender._id === user?.id;
            
            return (
              <div
                key={msg._id}
                className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
              >
                <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${isOwnMessage ? "flex-row-reverse space-x-reverse" : ""}`}>
                  {!isOwnMessage && (
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={otherParticipant?.avatar} />
                      <AvatarFallback className="bg-brown-200 text-brown-700 text-xs">
                        {otherParticipant?.fullName.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className={`rounded-2xl px-4 py-2 ${
                    isOwnMessage 
                      ? "bg-brown-600 text-white" 
                      : "bg-white border border-brown-200 text-brown-800"
                  }`}>
                    <p className="text-sm">{msg.content}</p>
                    <p className={`text-xs mt-1 ${
                      isOwnMessage ? "text-brown-200" : "text-brown-500"
                    }`}>
                      {formatTimestamp(msg.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 bg-white/80 backdrop-blur-sm border-t border-brown-200/50">
        <div className="flex items-center space-x-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 border-brown-300 focus:border-brown-500 bg-tan-50/50"
            disabled={sendMessageMutation.isPending}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim() || sendMessageMutation.isPending}
            className="bg-brown-600 hover:bg-brown-700 disabled:bg-brown-300"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
} 