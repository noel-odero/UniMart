
import { useState } from "react";
import { Plus, Search, Filter, Grid, List, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/auth-context";
import { useGetUserListings } from "@/features/listings";

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

const Dashboard = () => {
    const { user } = useAuth();
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [searchQuery, setSearchQuery] = useState("");

    // Get user's listings
    const { data: listingsData, isLoading, error } = useGetUserListings();
    const listings = listingsData?.listings || [];

    // Calculate real stats from listings
    const activeListings = listings.filter(listing => listing.status === 'active').length;
    const soldListings = listings.filter(listing => listing.status === 'sold').length;
    const totalViews = listings.reduce((sum, listing) => sum + listing.views, 0);
    const totalEarnings = listings
      .filter(listing => listing.status === 'sold')
      .reduce((sum, listing) => sum + listing.price, 0);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gradient-to-br from-tan-50 via-brown-50 to-tan-100 min-h-screen animate-fade-in">
        {/* Welcome Section */}
        <div className="mb-8">
            <h1 className="text-3xl font-bold text-brown-800 mb-2 text-shadow">Welcome back, {user?.fullName?.split(" ")[0]}!</h1>
            <p className="text-brown-600">Manage your listings and connect with your campus community.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="card-3d bg-gradient-to-br from-tan-50 to-brown-50 border-brown-200/50">
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-brown-600">Active Listings</p>
                    <p className="text-2xl font-bold text-brown-800">{activeListings}</p>
                </div>
                <div className="w-8 h-8 bg-brown-100 rounded-full flex items-center justify-center">
                    <Grid className="w-4 h-4 text-brown-600" />
                </div>
                </div>
            </CardContent>
            </Card>

            <Card className="card-3d bg-gradient-to-br from-tan-50 to-brown-50 border-brown-200/50">
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-brown-600">Total Sales</p>
                    <p className="text-2xl font-bold text-brown-800">{soldListings}</p>
                </div>
                <div className="w-8 h-8 bg-brown-100 rounded-full flex items-center justify-center">
                    <span className="text-brown-600 font-bold">RWF</span>
                </div>
                </div>
            </CardContent>
            </Card>

            <Card className="card-3d bg-gradient-to-br from-tan-50 to-brown-50 border-brown-200/50">
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-brown-600">Unread Messages</p>
                    <p className="text-2xl font-bold text-brown-800">3</p>
                </div>
                <div className="w-8 h-8 bg-brown-100 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-4 h-4 text-brown-600" />
                </div>
                </div>
            </CardContent>
            </Card>

            <Card className="card-3d bg-gradient-to-br from-tan-50 to-brown-50 border-brown-200/50">
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-brown-600">Total Views</p>
                    <p className="text-2xl font-bold text-brown-800">{totalViews}</p>
                </div>
                <div className="w-8 h-8 bg-brown-100 rounded-full flex items-center justify-center">
                    <span className="text-brown-600 font-bold">👁</span>
                </div>
                </div>
            </CardContent>
            </Card>

            <Card className="card-3d bg-gradient-to-br from-tan-50 to-brown-50 border-brown-200/50">
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-brown-600">Total Earnings</p>
                    <p className="text-2xl font-bold text-brown-800">RWF {totalEarnings}</p>
                </div>
                <div className="w-8 h-8 bg-brown-100 rounded-full flex items-center justify-center">
                    <span className="text-brown-600 font-bold">RWF</span>
                </div>
                </div>
            </CardContent>
            </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="listings" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-brown-100/70 border-brown-200/50">
            <TabsTrigger value="listings" className="text-brown-700 data-[state=active]:bg-brown-200 data-[state=active]:text-brown-800">My Listings</TabsTrigger>
            <TabsTrigger value="messages" className="text-brown-700 data-[state=active]:bg-brown-200 data-[state=active]:text-brown-800">Messages</TabsTrigger>
            <TabsTrigger value="purchases" className="text-brown-700 data-[state=active]:bg-brown-200 data-[state=active]:text-brown-800">My Purchases</TabsTrigger>
            <TabsTrigger value="wishlist" className="text-brown-700 data-[state=active]:bg-brown-200 data-[state=active]:text-brown-800">Wishlist</TabsTrigger>
            </TabsList>

            <TabsContent value="listings" className="space-y-6">
            {/* Actions Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center space-x-4 flex-1">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brown-500 w-4 h-4" />
                    <Input
                    placeholder="Search your listings..."
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
                
                <div className="flex items-center space-x-2">
                <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className={viewMode === "grid" ? "bg-brown-600 hover:bg-brown-700" : "border-brown-300 text-brown-700 hover:bg-brown-100"}
                >
                    <Grid className="w-4 h-4" />
                </Button>
                <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className={viewMode === "list" ? "bg-brown-600 hover:bg-brown-700" : "border-brown-300 text-brown-700 hover:bg-brown-100"}
                >
                    <List className="w-4 h-4" />
                </Button>
                <Button className="ml-4 bg-gradient-to-r from-brown-600 to-brown-700 hover:from-brown-700 hover:to-brown-800 button-3d">
                    <Plus className="w-4 h-4 mr-2" />
                    New Listing
                </Button>
                </div>
            </div>

            {/* Listings Grid/List */}
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-brown-600">Loading your listings...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-600">Error loading listings: {error.message}</p>
              </div>
            ) : listings.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-brown-500">No listings yet. Create your first listing!</p>
              </div>
            ) : (
              <div className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
                {listings.map((listing) => (
                <Card key={listing._id} className="card-3d bg-gradient-to-br from-tan-50 to-brown-50 border-brown-200/50">
                    <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                        <div>
                        <CardTitle className="text-lg text-brown-800">{listing.title}</CardTitle>
                        <CardDescription className="text-brown-600">{listing.category}</CardDescription>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        listing.status === "active" 
                            ? "bg-brown-100 text-brown-800" 
                            : "bg-brown-200 text-brown-700"
                        }`}>
                        {listing.status}
                        </span>
                    </div>
                    </CardHeader>
                    <CardContent>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold text-brown-600">RWF {listing.price}</span>
                        <span className="text-sm text-brown-500">{listing.views} views</span>
                        </div>
                        <div className="flex space-x-2">
                        <Button variant="outline" size="sm" className="flex-1 border-brown-300 text-brown-700 hover:bg-brown-100">
                            Edit
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1 border-brown-300 text-brown-700 hover:bg-brown-100">
                            View
                        </Button>
                        </div>
                    </div>
                    </CardContent>
                </Card>
                ))}
              </div>
            )}
            </TabsContent>

            <TabsContent value="messages" className="space-y-6">
            <Card className="card-3d bg-gradient-to-br from-tan-50 to-brown-50 border-brown-200/50">
                <CardHeader>
                <CardTitle className="text-brown-800">Recent Conversations</CardTitle>
                <CardDescription className="text-brown-600">Messages from buyers and sellers about your listings</CardDescription>
                </CardHeader>
                <CardContent>
                <div className="space-y-4">
                    {conversations.map((conversation) => (
                    <div
                        key={conversation.id}
                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-brown-100/50 transition-colors cursor-pointer"
                    >
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
                        <p className="text-xs text-brown-600 mb-1 truncate">About: {conversation.item}</p>
                        <p className="text-sm text-brown-600 truncate">{conversation.lastMessage}</p>
                        </div>
                        {conversation.unread > 0 && (
                        <div className="w-5 h-5 bg-brown-600 rounded-full flex items-center justify-center">
                            <span className="text-xs text-tan-50 font-medium">{conversation.unread}</span>
                        </div>
                        )}
                    </div>
                    ))}
                </div>
                </CardContent>
            </Card>
            </TabsContent>

            <TabsContent value="purchases">
            <Card className="card-3d bg-gradient-to-br from-tan-50 to-brown-50 border-brown-200/50">
                <CardHeader>
                <CardTitle className="text-brown-800">My Purchases</CardTitle>
                <CardDescription className="text-brown-600">Items you've bought from other students</CardDescription>
                </CardHeader>
                <CardContent>
                <p className="text-brown-500 text-center py-8">No purchases yet. Start shopping!</p>
                </CardContent>
            </Card>
            </TabsContent>

            <TabsContent value="wishlist">
            <Card className="card-3d bg-gradient-to-br from-tan-50 to-brown-50 border-brown-200/50">
                <CardHeader>
                <CardTitle className="text-brown-800">My Wishlist</CardTitle>
                <CardDescription className="text-brown-600">Items you're interested in buying</CardDescription>
                </CardHeader>
                <CardContent>
                <p className="text-brown-500 text-center py-8">Your wishlist is empty. Add some items!</p>
                </CardContent>
            </Card>
            </TabsContent>
        </Tabs>
        </div>
    );
};

export default Dashboard;
