
import { useState } from "react";
import { Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useGetConversations, type Conversation } from "@/features/conversations";
import { formatTimestamp } from "@/lib/utils";
import ConversationDetail from "@/components/ConversationDetail";

export default function Messages() {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Get conversations
  const { data: conversationsData, isLoading, error } = useGetConversations();
  const conversations = conversationsData?.conversations || [];

  // Filter conversations based on search
  const filteredConversations = conversations.filter(conversation => {
    const participantName = conversation.participants[0]?.fullName || "";
    const listingTitle = conversation.listing?.title || "";
    const searchLower = searchQuery.toLowerCase();
    
    return participantName.toLowerCase().includes(searchLower) || 
           listingTitle.toLowerCase().includes(searchLower);
  });

  const handleConversationClick = (conversation: Conversation) => {
    setSelectedConversation(conversation);
  };

  const handleBackToList = () => {
    setSelectedConversation(null);
  };

  // If a conversation is selected, show the detail view
  if (selectedConversation) {
    return (
      <div className="h-screen">
        <ConversationDetail 
          conversation={selectedConversation} 
          onBack={handleBackToList} 
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gradient-to-br from-tan-50 via-brown-50 to-tan-100 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brown-800 mb-2 text-shadow">Messages</h1>
        <p className="text-brown-600">Connect with buyers and sellers about your listings.</p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center space-x-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brown-500 w-4 h-4" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-brown-300 focus:border-brown-500 bg-tan-50/50"
            />
          </div>
          <Button variant="outline" size="sm" className="border-brown-300 text-brown-700 hover:bg-brown-100">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {/* Conversations List */}
      <Card className="card-3d bg-gradient-to-br from-tan-50 to-brown-50 border-brown-200/50">
        <CardHeader>
          <CardTitle className="text-brown-800">Conversations</CardTitle>
          <CardDescription className="text-brown-600">
            {filteredConversations.length} conversation{filteredConversations.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-brown-600">Loading conversations...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600">Error loading conversations: {error.message}</p>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-brown-500">
                {searchQuery ? "No conversations found matching your search." : "No conversations yet. Start selling to get messages!"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredConversations.map((conversation) => {
                const otherParticipant = conversation.participants[0];
                const lastMessage = conversation.lastMessage;
                
                return (
                  <div
                    key={conversation._id}
                    onClick={() => handleConversationClick(conversation)}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-brown-100/50 transition-colors cursor-pointer border border-transparent hover:border-brown-200"
                  >
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={otherParticipant?.avatar} />
                      <AvatarFallback className="bg-brown-200 text-brown-700">
                        {otherParticipant?.fullName.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-sm font-medium text-brown-800 truncate">
                          {otherParticipant?.fullName}
                        </p>
                        <p className="text-xs text-brown-500">
                          {formatTimestamp(conversation.lastActivity)}
                        </p>
                      </div>
                      <p className="text-xs text-brown-600 mb-1 truncate">
                        About: {conversation.listing.title}
                      </p>
                      <p className="text-sm text-brown-600 truncate">
                        {lastMessage?.content || "No messages yet"}
                      </p>
                    </div>
                    {conversation.unreadCount > 0 && (
                      <div className="w-6 h-6 bg-brown-600 rounded-full flex items-center justify-center">
                        <span className="text-xs text-tan-50 font-medium">
                          {conversation.unreadCount}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
