import { useState } from "react";
import { Search, Filter, Grid, List, Heart, MapPin } from "lucide-react";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const listings = [
  {
    id: 1,
    title: "MacBook Pro 13-inch 2020",
    price: 800,
    category: "Electronics",
    condition: "Like New",
    location: "University of Cape Town",
    seller: "Sarah Johnson",
    images: ["/placeholder.svg"],
    description: "Excellent condition MacBook Pro with charger and case",
    postedDate: "2 days ago",
    views: 24,
    isFavorited: false,
  },
  {
    id: 2,
    title: "Calculus Mathematics Textbook",
    price: 45,
    category: "Books",
    condition: "Good",
    location: "University of Witwatersrand",
    seller: "Mike Chen",
    images: ["/placeholder.svg"],
    description: "Third edition textbook in good condition",
    postedDate: "1 week ago",
    views: 12,
    isFavorited: true,
  },
  {
    id: 3,
    title: "Study Desk with Chair",
    price: 120,
    category: "Furniture",
    condition: "Good",
    location: "University of Ghana",
    seller: "Anna Wilson",
    images: ["/placeholder.svg"],
    description: "Solid wood desk with matching chair, perfect for studying",
    postedDate: "3 days ago",
    views: 18,
    isFavorited: false,
  },
  {
    id: 4,
    title: "iPhone 12 Pro",
    price: 650,
    category: "Electronics",
    condition: "Excellent",
    location: "University of Nairobi",
    seller: "John Doe",
    images: ["/placeholder.svg"],
    description: "128GB iPhone 12 Pro with original box and accessories",
    postedDate: "1 day ago",
    views: 45,
    isFavorited: false,
  },
  {
    id: 5,
    title: "Chemistry Lab Coat",
    price: 25,
    category: "Clothing",
    condition: "Good",
    location: "University of Lagos",
    seller: "Grace Okafor",
    images: ["/placeholder.svg"],
    description: "White lab coat, size Medium, barely used",
    postedDate: "5 days ago",
    views: 8,
    isFavorited: false,
  },
  {
    id: 6,
    title: "Economics Textbook Bundle",
    price: 85,
    category: "Books",
    condition: "Like New",
    location: "Cairo University",
    seller: "Ahmed Hassan",
    images: ["/placeholder.svg"],
    description: "3 economics textbooks required for first year",
    postedDate: "1 week ago",
    views: 22,
    isFavorited: true,
  },
];

const categories = [
  "all",
  "Electronics",
  "Books",
  "Furniture",
  "Clothing",
  "Sports",
  "Other",
];
const Browse = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const { data } = useGetListings();
  const listings = data?.listings || [];



  const filteredListings = listings.filter((listing) => {
    const matchesSearch =
      listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || listing.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedListings = [...filteredListings].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "popular":
        return b.views - a.views;
      default:
        return 0; // newest (default order)
    }
  });

  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [messageListing, setMessageListing] = useState<any>(null);
  const startConversation = useStartConversation();
  const navigate = useNavigate();

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
        onSuccess: (data) => {
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gradient-to-br from-tan-50 via-brown-50 to-tan-100 min-h-screen animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brown-800 mb-2 text-shadow">
          Browse Marketplace
        </h1>
        <p className="text-brown-600">
          Discover amazing items from students across African universities.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-gradient-to-r from-tan-50 to-brown-50 p-6 rounded-lg border border-brown-200/50 mb-8 card-3d">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          {/* Search */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brown-500 w-4 h-4" />
            <Input
              placeholder="Search for items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-brown-300 focus:border-brown-500 bg-tan-50/50"
            />
          </div>

          {/* Category Filter */}
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="border-brown-300 focus:border-brown-500 bg-tan-50/50">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="z-50 bg-tan-50 rounded-md shadow-lg">
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category === "all" ? "All Categories" : category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="border-brown-300 focus:border-brown-500 bg-tan-50/50">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* View Mode and Results Count */}
        <div className="flex justify-between items-center">
          <p className="text-brown-600 text-sm">
            {sortedListings.length} items found
          </p>
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className={
                viewMode === "grid"
                  ? "bg-brown-600 hover:bg-brown-700"
                  : "border-brown-300 text-brown-700 hover:bg-brown-100"
              }
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
              className={
                viewMode === "list"
                  ? "bg-brown-600 hover:bg-brown-700"
                  : "border-brown-300 text-brown-700 hover:bg-brown-100"
              }
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
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
                  {listing.category}
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
                {listing.title}
              </CardTitle>
              <CardDescription className="text-brown-600 line-clamp-2">
                {listing.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-brown-700">
                    RWF {listing.price}
                  </span>
                  <Badge
                    variant="outline"
                    className="border-brown-300 text-brown-600"
                  >
                    {listing.condition}
                  </Badge>
                </div>

                <div className="flex items-center text-sm text-brown-500">
                  <MapPin className="w-3 h-3 mr-1" />
                  {listing.location}
                </div>

                <div className="flex justify-between items-center text-sm text-brown-500">
                  <span>By {listing.seller.fullName}</span>
                  <span>{listing.views} views</span>
                </div>

                <div className="flex justify-between items-center text-xs text-brown-400">
                  <span>{listing.createdAt}</span>
                </div>

                <div className="flex space-x-2 pt-2">
                  <Button
                    size="sm"
                    className="flex-1 bg-brown-600 hover:bg-brown-700"
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

      {/* Message Modal */}
      <Dialog open={messageModalOpen} onOpenChange={setMessageModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Message Seller</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-brown-700">Send a message to the seller of <span className="font-semibold">{messageListing?.title}</span>:</p>
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
