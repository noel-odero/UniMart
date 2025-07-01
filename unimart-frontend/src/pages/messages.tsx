
import { useState } from "react";
import { Search, Send, MoreVertical } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Messages = () => {
    const [selectedChat, setSelectedChat] = useState<number | null>(1);
    const [newMessage, setNewMessage] = useState("");

    // Mock data - will be replaced with Supabase data
    const conversations = [
        {
        id: 1,
        name: "Sarah Johnson",
        lastMessage: "Is the laptop still available?",
        timestamp: "2 min ago",
        unread: 2,
        avatar: "/placeholder.svg",
        item: "MacBook Pro 13-inch"
        },
        {
        id: 2,
        name: "Mike Chen",
        lastMessage: "Thanks for the textbook!",
        timestamp: "1 hour ago",
        unread: 0,
        avatar: "/placeholder.svg",
        item: "Calculus Textbook"
        },
        {
        id: 3,
        name: "Anna Wilson",
        lastMessage: "Can we meet tomorrow?",
        timestamp: "3 hours ago",
        unread: 1,
        avatar: "/placeholder.svg",
        item: "Study Desk"
        }
    ];

    const messages = [
        {
        id: 1,
        senderId: 2,
        content: "Hi! I'm interested in your MacBook Pro. Is it still available?",
        timestamp: "10:30 AM",
        isMe: false
        },
        {
        id: 2,
        senderId: 1,
        content: "Yes, it's still available! It's in excellent condition.",
        timestamp: "10:32 AM",
        isMe: true
        },
        {
        id: 3,
        senderId: 2,
        content: "Great! Can I see some more photos? And what's your best price?",
        timestamp: "10:35 AM",
        isMe: false
        },
        {
        id: 4,
        senderId: 2,
        content: "Is the laptop still available?",
        timestamp: "11:45 AM",
        isMe: false
        }
    ];

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        
        // TODO: Implement message sending with Supabase
        console.log("Sending message:", newMessage);
        setNewMessage("");
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gradient-to-br from-tan-50 via-brown-50 to-tan-100 min-h-screen animate-fade-in">
        <div className="mb-8">
            <h1 className="text-3xl font-bold text-brown-800 mb-2 text-shadow">Messages</h1>
            <p className="text-brown-600">Connect with buyers and sellers in your campus community.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
            {/* Conversations List */}
            <Card className="lg:col-span-1 card-3d bg-gradient-to-br from-tan-50 to-brown-50 border-brown-200/50">
            <CardHeader>
                <CardTitle className="text-lg text-brown-800">Conversations</CardTitle>
                <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brown-500 w-4 h-4" />
                <Input placeholder="Search conversations..." className="pl-10 border-brown-300 focus:border-brown-500 bg-tan-50/50" />
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="space-y-0">
                {conversations.map((conversation) => (
                    <div
                    key={conversation.id}
                    onClick={() => setSelectedChat(conversation.id)}
                    className={`p-4 cursor-pointer hover:bg-brown-100/50 border-b border-brown-200/30 transition-colors ${
                        selectedChat === conversation.id ? "bg-brown-200/70 border-brown-300" : ""
                    }`}
                    >
                    <div className="flex items-center space-x-3">
                        <Avatar className="w-10 h-10">
                        <AvatarImage src={conversation.avatar} />
                        <AvatarFallback className="bg-brown-200 text-brown-700">
                            {conversation.name.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                            <p className="text-sm font-medium text-brown-800 truncate">
                            {conversation.name}
                            </p>
                            <p className="text-xs text-brown-500">{conversation.timestamp}</p>
                        </div>
                        <p className="text-xs text-brown-600 mb-1 truncate">{conversation.item}</p>
                        <p className="text-sm text-brown-600 truncate">{conversation.lastMessage}</p>
                        </div>
                        {conversation.unread > 0 && (
                        <div className="w-5 h-5 bg-brown-600 rounded-full flex items-center justify-center">
                            <span className="text-xs text-tan-50 font-medium">{conversation.unread}</span>
                        </div>
                        )}
                    </div>
                    </div>
                ))}
                </div>
            </CardContent>
            </Card>

            {/* Chat Area */}
            <Card className="lg:col-span-2 card-3d bg-gradient-to-br from-tan-50 to-brown-50 border-brown-200/50">
            {selectedChat ? (
                <>
                {/* Chat Header */}
                <CardHeader className="border-b border-brown-200/50">
                    <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Avatar className="w-8 h-8">
                        <AvatarImage src="/placeholder.svg" />
                        <AvatarFallback className="bg-brown-200 text-brown-700">SJ</AvatarFallback>
                        </Avatar>
                        <div>
                        <p className="font-medium text-brown-800">Sarah Johnson</p>
                        <p className="text-sm text-brown-600">About: MacBook Pro 13-inch</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-brown-600 hover:bg-brown-100">
                        <MoreVertical className="w-4 h-4" />
                    </Button>
                    </div>
                </CardHeader>

                {/* Messages */}
                <CardContent className="flex-1 p-0">
                    <div className="h-96 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => (
                        <div
                        key={message.id}
                        className={`flex ${message.isMe ? "justify-end" : "justify-start"}`}
                        >
                        <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.isMe
                                ? "bg-brown-600 text-tan-50"
                                : "bg-brown-100 text-brown-800"
                            }`}
                        >
                            <p className="text-sm">{message.content}</p>
                            <p className={`text-xs mt-1 ${
                            message.isMe ? "text-brown-200" : "text-brown-500"
                            }`}>
                            {message.timestamp}
                            </p>
                        </div>
                        </div>
                    ))}
                    </div>

                    {/* Message Input */}
                    <div className="border-t border-brown-200/50 p-4">
                    <form onSubmit={handleSendMessage} className="flex space-x-2">
                        <Input
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="flex-1 border-brown-300 focus:border-brown-500 bg-tan-50/50"
                        />
                        <Button type="submit" size="sm" className="bg-brown-600 hover:bg-brown-700">
                        <Send className="w-4 h-4" />
                        </Button>
                    </form>
                    </div>
                </CardContent>
                </>
            ) : (
                <CardContent className="flex items-center justify-center h-full">
                <div className="text-center text-brown-500">
                    <p className="text-lg mb-2">Select a conversation</p>
                    <p className="text-sm">Choose a conversation from the list to start messaging</p>
                </div>
                </CardContent>
            )}
            </Card>
        </div>
        </div>
    );
};

export default Messages;
