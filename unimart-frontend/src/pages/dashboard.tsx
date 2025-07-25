
import { useState } from "react";
import { Plus, Search, Filter, Grid, List, MessageCircle, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/auth-context";
import { useGetMyListings, useCreateListing, useUpdateListing, useDeleteListing, API_BASE, useGetWishlistListings } from "@/features/listings";
import { useGetConversations } from "@/features/conversations";
import { formatTimestamp } from "@/lib/utils";
import ConversationDetail from "@/components/ConversationDetail";
import CreateListingForm, { type ListingFormData } from "@/components/CreateListingForm";
import EditListingForm, { type EditListingFormData } from "@/components/EditListingForm";
import ListingDetail from "@/components/ListingDetail";
import type { Conversation } from "@/features/conversations";
import type { Listing } from "@/features/listings";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useQueryClient } from "@tanstack/react-query";

// const conversations = [
//     {
//     id: 1,
//     name: "Sarah Johnson",
//     lastMessage: "Is the laptop still available?",
//     timestamp: "2 min ago",
//     unread: 2,
//     avatar: "/placeholder.svg",
//     item: "MacBook Pro 13-inch"
//     },
//     {
//     id: 2,
//     name: "Mike Chen",
//     lastMessage: "Thanks for the textbook!",
//     timestamp: "1 hour ago",
//     unread: 0,
//     avatar: "/placeholder.svg",
//     item: "Calculus Textbook"
//     },
//     {
//     id: 3,
//     name: "Anna Wilson",
//     lastMessage: "Can we meet tomorrow?",
//     timestamp: "3 hours ago",
//     unread: 1,
//     avatar: "/placeholder.svg",
//     item: "Study Desk"
//     }
// ];

const Dashboard = () => {
    const { user } = useAuth();
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
    const [editingListing, setEditingListing] = useState<Listing | null>(null);
    const [listingsTab, setListingsTab] = useState<'active' | 'sold'>('active');
    const [markingAsSold, setMarkingAsSold] = useState<Listing | null>(null);
    const [soldPriceInput, setSoldPriceInput] = useState<string>("");
    const [isSubmittingSold, setIsSubmittingSold] = useState(false);
    const queryClient = useQueryClient();

    const { data: listingsData, isLoading, error } = useGetMyListings({ status: 'all' });
    const listings = listingsData?.listings || [];
    const validListings = (listings ?? []).filter((l): l is Listing => !!l && typeof l === 'object');
    const activeListingsArr = validListings.filter(listing => listing && listing.status === 'active');
    const soldListingsArr = validListings.filter(listing => listing && listing.status === 'sold');

    const { data: conversationsData } = useGetConversations();
    const conversations = conversationsData?.conversations || [];

    const { data: wishlistListings, isLoading: isWishlistLoading, error: wishlistError } = useGetWishlistListings();

    const createListingMutation = useCreateListing();
    const updateListingMutation = useUpdateListing();
    const deleteListingMutation = useDeleteListing();

    const activeListings = validListings.filter(listing => listing.status === 'active').length;
    const soldListings = validListings.filter(listing => listing.status === 'sold').length;
    
    const totalEarnings = validListings
      .filter(listing => listing.status === 'sold')
      .reduce((sum, listing) => sum + (listing.soldPrice || listing.price), 0);
    
    const totalUnreadMessages = conversations.reduce((sum, conversation) => sum + conversation.unreadCount, 0);

    const handleConversationClick = (conversation: Conversation) => {
        setSelectedConversation(conversation);
    };

    const handleBackToList = () => {
        setSelectedConversation(null);
        setSelectedListing(null);
        setEditingListing(null);
    };

    const handleBackFromListing = () => {
        setSelectedListing(null);
    };

    const handleCreateListing = (data: ListingFormData) => {
        createListingMutation.mutate(data, {
            onSuccess: () => {
                setShowCreateForm(false);
            }
        });
    };

    const handleEditListing = (listing: Listing) => {
        setEditingListing(listing);
    };

    const handleUpdateListing = (data: EditListingFormData) => {
        if (editingListing) {
            updateListingMutation.mutate({
                id: editingListing._id,
                data
            }, {
                onSuccess: () => {
                    setEditingListing(null);
                }
            });
        }
    };

    const handleViewListing = (listing: Listing) => {
        console.log("View listing clicked:", listing);
        setSelectedListing(listing);
    };

    const handleMarkAsSold = (listing: Listing) => {
      setMarkingAsSold(listing);
      setSoldPriceInput(listing.price?.toString() || "");
    };
    const handleConfirmMarkAsSold = async () => {
      if (!markingAsSold) return;
      setIsSubmittingSold(true);
      try {
        const res = await fetch(`${API_BASE}/listings/${markingAsSold._id}/sold`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ soldPrice: parseFloat(soldPriceInput) || markingAsSold.price }),
        });
        const data = await res.json();
        if (res.ok) {
          toast.success(data.message || "Listing marked as sold");
          setMarkingAsSold(null);
          setSoldPriceInput("");
          // Invalidate listings query so stats and tabs update
          queryClient.invalidateQueries({ queryKey: ["user-listings"] });
        } else {
          toast.error(data.message || "Failed to mark as sold");
        }
      } catch (err: any) {
        toast.error(err.message || "Failed to mark as sold");
      } finally {
        setIsSubmittingSold(false);
      }
    };
    const handleCancelMarkAsSold = () => {
      setMarkingAsSold(null);
      setSoldPriceInput("");
    };

    const handleDeleteListing = async (listing: Listing) => {
      const confirmed = window.confirm("Are you sure you want to delete this listing?");
      if (confirmed) {
        deleteListingMutation.mutate(listing._id);
      }
    };

    // If editing a listing, show the edit form
    if (editingListing) {
        return (
            <EditListingForm
                listing={editingListing}
                onBack={() => setEditingListing(null)}
                onSubmit={handleUpdateListing}
                isLoading={updateListingMutation.isPending}
            />
        );
    }

    // If a listing is selected for viewing, show the detail view
    if (selectedListing) {
        console.log("Rendering ListingDetail for:", selectedListing);
        return (
            <ListingDetail 
                listing={selectedListing} 
                onBack={handleBackFromListing} 
            />
        );
    }

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

    // If create form is shown, display it
    if (showCreateForm) {
        return (
            <CreateListingForm
                onBack={() => setShowCreateForm(false)}
                onSubmit={handleCreateListing}
                isLoading={createListingMutation.isPending}
            />
        );
    }

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
                    <p className="text-2xl font-bold text-brown-800">{totalUnreadMessages}</p>
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
        <Tabs defaultValue={listingsTab} className="space-y-6" onValueChange={v => setListingsTab(v as 'active' | 'sold')}>
            <TabsList className="grid w-full grid-cols-5 bg-brown-100/70 border-brown-200/50">
                <TabsTrigger value="active" className="text-brown-700 data-[state=active]:bg-brown-200 data-[state=active]:text-brown-800">Active Listings</TabsTrigger>
                <TabsTrigger value="sold" className="text-brown-700 data-[state=active]:bg-brown-200 data-[state=active]:text-brown-800">Sold Listings</TabsTrigger>
                <TabsTrigger value="messages" className="text-brown-700 data-[state=active]:bg-brown-200 data-[state=active]:text-brown-800">Messages</TabsTrigger>
                <TabsTrigger value="purchases" className="text-brown-700 data-[state=active]:bg-brown-200 data-[state=active]:text-brown-800">My Purchases</TabsTrigger>
                <TabsTrigger value="wishlist" className="text-brown-700 data-[state=active]:bg-brown-200 data-[state=active]:text-brown-800">Wishlist</TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-6">
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
                    <Button 
                        className="ml-4 bg-gradient-to-r from-brown-600 to-brown-700 hover:from-brown-700 hover:to-brown-800 button-3d"
                        onClick={() => setShowCreateForm(true)}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        New Listing
                    </Button>
                    </div>
                </div>

                {/* Listings Grid/List for Active */}
                {isLoading ? (
                    <div className="text-center py-8">
                        <p className="text-brown-600">Loading your listings...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-8">
                        <p className="text-red-600">Error loading listings: {error.message}</p>
                    </div>
                ) : activeListingsArr.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-brown-500">No active listings yet. Create your first listing!</p>
                    </div>
                ) : (
                    <div className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
                        {activeListingsArr.map((listing) => (
                            listing ? (
                                <Card key={listing._id} className="card-3d bg-gradient-to-br from-tan-50 to-brown-50 border-brown-200/50">
                                    <CardHeader className="pb-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="text-lg text-brown-800">{listing?.title || "Untitled"}</CardTitle>
                                                <CardDescription className="text-brown-600">{listing?.category || "No category"}</CardDescription>
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
                                                <span className="text-2xl font-bold text-brown-600">RWF {listing?.price ?? 0}</span>
                                            </div>
                                            <div className="flex space-x-2">
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    className="flex-1 border-brown-300 text-brown-700 hover:bg-brown-100"
                                                    onClick={() => handleEditListing(listing)}
                                                >
                                                    <Edit className="w-3 h-3 mr-1" />
                                                    Edit
                                                </Button>
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    className="flex-1 border-brown-300 text-brown-700 hover:bg-brown-100"
                                                    onClick={() => handleViewListing(listing)}
                                                >
                                                    View
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex-1 border-brown-300 text-brown-700 hover:bg-brown-100"
                                                    onClick={() => handleMarkAsSold(listing)}
                                                    disabled={listing.status === 'sold'}
                                                >
                                                    Mark as Sold
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    className="flex-1 border-brown-300 text-red-700 hover:bg-red-100"
                                                    onClick={() => handleDeleteListing(listing)}
                                                >
                                                    Delete
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : null
                        ))}
                    </div>
                )}
            </TabsContent>

            <TabsContent value="sold" className="space-y-6">
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
                    <Button 
                        className="ml-4 bg-gradient-to-r from-brown-600 to-brown-700 hover:from-brown-700 hover:to-brown-800 button-3d"
                        onClick={() => setShowCreateForm(true)}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        New Listing
                    </Button>
                    </div>
                </div>

                {/* Listings Grid/List for Sold */}
                {isLoading ? (
                    <div className="text-center py-8">
                        <p className="text-brown-600">Loading your listings...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-8">
                        <p className="text-red-600">Error loading listings: {error.message}</p>
                    </div>
                ) : soldListingsArr.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-brown-500">No sold listings yet.</p>
                    </div>
                ) : (
                    <div className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
                        {soldListingsArr.map((listing) => (
                            listing ? (
                                <Card key={listing._id} className="card-3d bg-gradient-to-br from-tan-50 to-brown-50 border-brown-200/50">
                                    <CardHeader className="pb-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="text-lg text-brown-800">{listing?.title || "Untitled"}</CardTitle>
                                                <CardDescription className="text-brown-600">{listing?.category || "No category"}</CardDescription>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                listing.status === "sold" 
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
                                                <span className="text-2xl font-bold text-brown-600">RWF {listing?.soldPrice || listing?.price || 0}</span>
                                            </div>
                                            <div className="flex space-x-2">
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    className="flex-1 border-brown-300 text-brown-700 hover:bg-brown-100"
                                                    onClick={() => handleEditListing(listing)}
                                                >
                                                    <Edit className="w-3 h-3 mr-1" />
                                                    Edit
                                                </Button>
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    className="flex-1 border-brown-300 text-brown-700 hover:bg-brown-100"
                                                    onClick={() => handleViewListing(listing)}
                                                >
                                                    View
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex-1 border-brown-300 text-brown-700 hover:bg-brown-100"
                                                    onClick={() => handleMarkAsSold(listing)}
                                                    disabled={listing.status === 'sold'}
                                                >
                                                    Mark as Sold
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    className="flex-1 border-brown-300 text-red-700 hover:bg-red-100"
                                                    onClick={() => handleDeleteListing(listing)}
                                                >
                                                    Delete
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : null
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
                    {conversations.map((conversation) => 
                    <div
                        key={conversation._id}
                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-brown-100/50 transition-colors cursor-pointer"
                        onClick={() => handleConversationClick(conversation)}
                    >
                        <Avatar className="w-10 h-10">
                        <AvatarImage src={conversation.participants?.[0]?.avatar} />
                        <AvatarFallback className="bg-brown-200 text-brown-700">
                            {(conversation.participants?.[0]?.fullName || "??").split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                            <p className="text-sm font-medium text-brown-800 truncate">
                            {conversation.participants?.[0]?.fullName || "Unknown"}
                            </p>
                            <p className="text-xs text-brown-500">{formatTimestamp(conversation.lastActivity)}</p>
                        </div>
                        <p className="text-xs text-brown-600 mb-1 truncate">
                            About: {conversation.listing?.title || "Unknown item"}
                        </p>
                        <p className="text-sm text-brown-600 truncate">{conversation.lastMessage?.content || "No messages yet"}</p>
                        </div>
                        {conversation.unreadCount > 0 && (
                        <div className="w-5 h-5 bg-brown-600 rounded-full flex items-center justify-center">
                            <span className="text-xs text-tan-50 font-medium">{conversation.unreadCount}</span>
                        </div>
                        )}
                    </div>
                    )}
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
                {isWishlistLoading ? (
                    <p className="text-brown-600 text-center py-8">Loading wishlist...</p>
                ) : wishlistError ? (
                    <p className="text-red-600 text-center py-8">Error loading wishlist: {wishlistError.message}</p>
                ) : !wishlistListings || wishlistListings.length === 0 ? (
                    <p className="text-brown-500 text-center py-8">Your wishlist is empty. Add some items!</p>
                ) : (
                    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                        {wishlistListings.map((listing) => (
                            <Card key={listing._id} className="card-3d bg-gradient-to-br from-tan-50 to-brown-50 border-brown-200/50">
                                <CardHeader className="pb-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-lg text-brown-800">{listing?.title || "Untitled"}</CardTitle>
                                            <CardDescription className="text-brown-600">{listing?.category || "No category"}</CardDescription>
                                        </div>
                                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-brown-100 text-brown-800">Wishlist</span>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-2xl font-bold text-brown-600">RWF {listing?.price ?? 0}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
                </CardContent>
            </Card>
            </TabsContent>
        </Tabs>
        {/* Mark as Sold Modal */}
        <Dialog open={!!markingAsSold} onOpenChange={handleCancelMarkAsSold}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Mark as Sold</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-brown-700">Enter the final sold price for <span className="font-semibold">{markingAsSold?.title}</span>:</p>
              <Input
                type="number"
                min={0}
                step={1}
                value={soldPriceInput}
                onChange={e => setSoldPriceInput(e.target.value)}
                className="border-brown-300 focus:border-brown-500"
                placeholder="Sold price (RWF)"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleCancelMarkAsSold} disabled={isSubmittingSold}>Cancel</Button>
              <Button onClick={handleConfirmMarkAsSold} disabled={isSubmittingSold || !soldPriceInput}>
                {isSubmittingSold ? "Processing..." : "Confirm"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
    );
};

export default Dashboard;
