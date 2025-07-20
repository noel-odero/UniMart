import { ArrowLeft, Eye, MapPin, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Listing } from "@/features/listings";
import { formatTimestamp } from "@/lib/utils";

interface ListingDetailProps {
  listing: Listing;
  onBack: () => void;
}

export default function ListingDetail({ listing, onBack }: ListingDetailProps) {
  // Safety check for listing data
  if (!listing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-tan-50 via-brown-50 to-tan-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-3 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-brown-700 hover:bg-brown-100"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-2xl font-bold text-brown-800">Listing Details</h1>
          </div>
          <p className="text-brown-600">No listing data available.</p>
        </div>
      </div>
    );
  }

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'New': return 'bg-green-100 text-green-800';
      case 'Like New': return 'bg-blue-100 text-blue-800';
      case 'Good': return 'bg-yellow-100 text-yellow-800';
      case 'Fair': return 'bg-orange-100 text-orange-800';
      case 'Poor': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-tan-50 via-brown-50 to-tan-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-brown-700 hover:bg-brown-100"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold text-brown-800">Listing Details</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Images Section */}
          <Card className="card-3d bg-gradient-to-br from-tan-50 to-brown-50 border-brown-200/50">
            <CardHeader>
              <CardTitle className="text-brown-800">Images</CardTitle>
            </CardHeader>
            <CardContent>
              {listing.images && listing.images.length > 0 ? (
                <div className="space-y-4">
                  <div className="aspect-square rounded-lg overflow-hidden">
                    <img
                      src={listing.images[0]}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {listing.images.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                      {listing.images.slice(1).map((image, index) => (
                        <div key={index} className="aspect-square rounded-lg overflow-hidden">
                          <img
                            src={image}
                            alt={`${listing.title} ${index + 2}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="aspect-square bg-brown-100 rounded-lg flex items-center justify-center">
                  <p className="text-brown-500">No images available</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Details Section */}
          <div className="space-y-6">
            {/* Main Info */}
            <Card className="card-3d bg-gradient-to-br from-tan-50 to-brown-50 border-brown-200/50">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-brown-800 text-xl">{listing.title}</CardTitle>
                    <p className="text-2xl font-bold text-brown-600 mt-2">RWF {listing.price.toLocaleString()}</p>
                  </div>
                  <Badge className={`${getConditionColor(listing.condition)}`}>
                    {listing.condition}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-brown-700 leading-relaxed">{listing.description}</p>
                
                <div className="flex items-center space-x-2 text-brown-600">
                  <Eye className="w-4 h-4" />
                  <span className="text-sm">{listing.views} views</span>
                </div>
              </CardContent>
            </Card>

            {/* Category & Status */}
            <Card className="card-3d bg-gradient-to-br from-tan-50 to-brown-50 border-brown-200/50">
              <CardHeader>
                <CardTitle className="text-brown-800">Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-brown-600">Category:</span>
                  <Badge variant="outline" className="border-brown-300 text-brown-700">
                    {listing.category}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-brown-600">Status:</span>
                  <Badge className={
                    listing.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : listing.status === 'sold'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }>
                    {listing.status}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-brown-600">Location:</span>
                  <span className="text-brown-800">{listing.location || "Not specified"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-brown-600">University:</span>
                  <span className="text-brown-800">{listing.university || "Not specified"}</span>
                </div>
              </CardContent>
            </Card>

            {/* Seller Info */}
            <Card className="card-3d bg-gradient-to-br from-tan-50 to-brown-50 border-brown-200/50">
              <CardHeader>
                <CardTitle className="text-brown-800">Seller Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={listing.seller?.avatar} />
                    <AvatarFallback className="bg-brown-200 text-brown-700">
                      {listing.seller?.fullName?.split(" ").map(n => n[0]).join("") || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-brown-800">{listing.seller?.fullName || "Unknown Seller"}</p>
                    <p className="text-sm text-brown-600">{listing.seller?.university || "Unknown University"}</p>
                    {listing.seller?.rating && listing.seller?.reviewCount && (
                      <div className="flex items-center space-x-1 mt-1">
                        <span className="text-sm text-brown-600">Rating:</span>
                        <span className="text-sm font-medium text-brown-800">
                          {listing.seller.rating}/5 ({listing.seller.reviewCount} reviews)
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timestamps */}
            <Card className="card-3d bg-gradient-to-br from-tan-50 to-brown-50 border-brown-200/50">
              <CardHeader>
                <CardTitle className="text-brown-800">Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-brown-600">
                  <Calendar className="w-4 h-4" />
                  <span>Created: {formatTimestamp(listing.createdAt)}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-brown-600">
                  <Calendar className="w-4 h-4" />
                  <span>Updated: {formatTimestamp(listing.updatedAt)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 