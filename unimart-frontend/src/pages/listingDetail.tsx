import { useParams, useNavigate } from "react-router-dom";
import { useGetListing } from "@/features/listings";
import ListingDetail from "@/components/ListingDetail";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, error } = useGetListing(id!);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-brown-600">Loading listing...</div>;
  }
  if (error || !data?.listing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-tan-50 via-brown-50 to-tan-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-3 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="text-brown-700 hover:bg-brown-100"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-2xl font-bold text-brown-800">Listing Details</h1>
          </div>
          <p className="text-brown-600">Listing not found.</p>
        </div>
      </div>
    );
  }

  return <ListingDetail listing={data.listing} onBack={() => navigate(-1)} />;
} 