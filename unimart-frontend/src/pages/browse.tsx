import { useState } from "react";
import { Search, Grid, List, Heart, MapPin, Tag, Shirt, Book, Tv, Dumbbell, MoreHorizontal} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetListings } from "@/features/listings";
import { useStartConversation } from "@/features/conversations";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const categories = [
  { key: "all", label: "All", icon: Tag },
  { key: "Electronics", label: "Electronics", icon: Tv },
  { key: "Books", label: "Books", icon: Book },
  { key: "Furniture", label: "Furniture", icon: ChairIcon },
  { key: "Clothing", label: "Clothing", icon: Shirt },
  { key: "Sports", label: "Sports", icon: Dumbbell },
  { key: "Food", label: "Food", icon: UtensilsIcon },
  { key: "Services", label: "Services", icon: WrenchIcon },
  { key: "Other", label: "Other", icon: MoreHorizontal },
];

function ChairIcon(props: any) {
  // Simple chair icon for Furniture
  return (
    <svg {...props} viewBox="0 0 20 20" fill="none" stroke="currentColor"><rect x="5" y="8" width="10" height="6" rx="2" strokeWidth="1.5"/><path d="M7 14v3M13 14v3" strokeWidth="1.5"/></svg>
  );
}

function UtensilsIcon(props: any) {
  // Simple utensils icon for Food
  return (
    <svg {...props} viewBox="0 0 20 20" fill="none" stroke="currentColor"><path d="M6 2v8M6 10v8M10 2v8M10 10v8M14 2v8M14 10v8" strokeWidth="1.5"/><circle cx="6" cy="2" r="1.5"/><circle cx="10" cy="2" r="1.5"/><circle cx="14" cy="2" r="1.5"/></svg>
  );
}

function WrenchIcon(props: any) {
  // Simple wrench icon for Services
  return (
    <svg {...props} viewBox="0 0 20 20" fill="none" stroke="currentColor"><path d="M17.657 6.343a6 6 0 0 1-8.485 8.485l-4.95 4.95a1 1 0 0 1-1.415-1.415l4.95-4.95a6 6 0 0 1 8.485-8.485z" strokeWidth="1.5"/></svg>
  );
}

// const navLinks = [
//   { label: "Browse all", icon: Home },
//   { label: "Notifications", icon: Bell },
//   { label: "Inbox", icon: Inbox },
//   { label: "Marketplace access", icon: ShoppingBag },
//   { label: "Buying", icon: User2 },
//   { label: "Selling", icon: User2 },
// ];

const Browse = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const { data } = useGetListings();
  const safeListings = (data?.listings ?? []).filter(l => l && typeof l === 'object');
  const filteredListings = safeListings.filter((listing) => {
    const matchesSearch =
      (listing.title?.toLowerCase() ?? "").includes(searchQuery.toLowerCase()) ||
      (listing.description?.toLowerCase() ?? "").includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || listing.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedListings = [...filteredListings].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return (a.price ?? 0) - (b.price ?? 0);
      case "price-high":
        return (b.price ?? 0) - (a.price ?? 0);
      default:
        return 0; // newest (default order)
    }
  });

  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [messageListing, setMessageListing] = useState<any>(null);
  const startConversation = useStartConversation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Refetch listings when the page regains focus (e.g., after navigating back)
  useEffect(() => {
    const handleFocus = () => {
      queryClient.refetchQueries({ queryKey: ["listings"] });
    };
    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [queryClient]);

  const handleOpenMessageModal = (listing: any) => {
    setMessageListing(listing);
    setMessageText("");
    setMessageModalOpen(true);
  };

  const handleSendMessage = async () => {
    if (!messageListing || !messageText.trim()) return;
    startConversation.mutate(
      { listingId: messageListing._id, initialMessage: messageText },
      {
        onSuccess: () => {
          setMessageModalOpen(false);
          setMessageText("");
          setMessageListing(null);
          // Navigate to messages page (optionally open the conversation)
          navigate("/messages");
        },
      }
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-6 min-h-screen bg-gradient-to-br from-tan-50 via-brown-50 to-tan-100 animate-fade-in">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0 mb-6 md:mb-0 bg-tan-50 border border-brown-100/60 rounded-xl p-4 shadow-sm h-fit sticky top-4">
          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brown-400 w-4 h-4" />
              <Input
                placeholder="Search Marketplace..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-brown-300 focus:border-brown-500 bg-tan-50/50"
              />
            </div>
          </div>
          {/* Categories */}
          <div>
            <div className="text-xs text-brown-500 mb-1">Categories</div>
            <div className="flex flex-col gap-1">
              {categories.map(({ key, label, icon: Icon }) => (
                <Button
                  key={key}
                  variant={selectedCategory === key ? "default" : "ghost"}
                  className={`w-full justify-start ${selectedCategory === key ? "bg-brown-600 text-white" : "text-brown-700 hover:bg-brown-100"}`}
                  size="sm"
                  onClick={() => setSelectedCategory(key)}
                >
                  <Icon className="w-4 h-4 mr-2" /> {label}
                </Button>
              ))}
            </div>
          </div>
        </aside>
        {/* Main Content */}
        <main className="flex-1">
          {/* Sort & View Mode Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
            <h2 className="text-2xl font-bold text-brown-800 mb-2 sm:mb-0">Browse Marketplace</h2>
            <div className="flex items-center gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="border-brown-300 focus:border-brown-500 bg-tan-50/50 min-w-[120px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="z-50 bg-tan-50 rounded-md shadow-lg">
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="icon"
                onClick={() => setViewMode("grid")}
                className={viewMode === "grid" ? "bg-brown-600 text-white" : "text-brown-600 hover:bg-brown-100"}
                title="Grid view"
              >
                <Grid className="w-5 h-5" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="icon"
                onClick={() => setViewMode("list")}
                className={viewMode === "list" ? "bg-brown-600 text-white" : "text-brown-600 hover:bg-brown-100"}
                title="List view"
              >
                <List className="w-5 h-5" />
              </Button>
            </div>
          </div>
          {/* Listings Grid/List */}
          <div
            className={`grid gap-6 ${
              viewMode === "grid"
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                : "grid-cols-1"
            }`}
          >
            {sortedListings.map((listing) => (
              <Card
                key={listing._id}
                className="card-3d bg-gradient-to-br from-tan-50 to-brown-50 border-brown-200/50 hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start mb-2">
                    <Badge
                      variant="secondary"
                      className="bg-brown-100 text-brown-800"
                    >
                      {listing.category || "No Category"}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-1 text-brown-400 hover:text-red-500"
                    >
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                  <CardTitle className="text-lg text-brown-800 line-clamp-1">
                    {listing.title || "Untitled"}
                  </CardTitle>
                  <CardDescription className="text-brown-600 line-clamp-2">
                    {listing.description || "No description available"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-brown-700">
                        RWF {listing.price ?? 0}
                      </span>
                      <Badge
                        variant="outline"
                        className="border-brown-300 text-brown-600"
                      >
                        {listing.condition || "Unknown Condition"}
                      </Badge>
                    </div>

                    <div className="flex items-center text-sm text-brown-500">
                      <MapPin className="w-3 h-3 mr-1" />
                      {listing.location || "Location not specified"}
                    </div>

                    <div className="flex justify-between items-center text-sm text-brown-500">
                      <span>By {listing.seller?.fullName || "Seller"}</span>
                    </div>

                    <div className="flex justify-between items-center text-xs text-brown-400">
                      <span>{listing.createdAt || "Date unknown"}</span>
                    </div>

                    <div className="flex space-x-2 pt-2">
                      <Button
                        size="sm"
                        className="flex-1 bg-brown-600 hover:bg-brown-700"
                        onClick={async () => {
                          await navigate(`/listing/${listing._id}`);
                          // Invalidate listings query to refetch updated views when returning
                          queryClient.invalidateQueries({ queryKey: ["listings"] });
                        }}
                      >
                        View Details
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-brown-300 text-brown-700 hover:bg-brown-100"
                        onClick={() => handleOpenMessageModal(listing)}
                      >
                        Message
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {sortedListings.length === 0 && (
            <div className="text-center py-16">
              <div className="text-brown-400 mb-4">
                <Search className="w-16 h-16 mx-auto mb-4" />
              </div>
              <h3 className="text-xl font-semibold text-brown-700 mb-2">
                No items found
              </h3>
              <p className="text-brown-600">Try adjusting your search or filters</p>
            </div>
          )}
        </main>
      </div>

      {/* Message Modal */}
      <Dialog open={messageModalOpen} onOpenChange={setMessageModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Message Seller</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-brown-700">Send a message to the seller of <span className="font-semibold">{messageListing?.title || "this item"}</span>:</p>
            <Textarea
              value={messageText}
              onChange={e => setMessageText(e.target.value)}
              placeholder="Type your message..."
              className="min-h-[80px]"
              maxLength={1000}
            />
          </div>
          <DialogFooter>
            <Button
              onClick={handleSendMessage}
              disabled={startConversation.isPending || !messageText.trim()}
              className="bg-brown-600 hover:bg-brown-700"
            >
              {startConversation.isPending ? "Sending..." : "Send Message"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Browse;
