import { useState, useRef } from "react";
import { ArrowLeft, X, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface CreateListingFormProps {
  onBack: () => void;
  onSubmit: (data: ListingFormData) => void;
  isLoading?: boolean;
}

export interface ListingFormData {
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  images: File[];
}

const CATEGORIES = [
  "Electronics",
  "Books", 
  "Furniture",
  "Clothing",
  "Food",
  "Sports",
  "Other"
];

const CONDITIONS = [
  "New",
  "Like New", 
  "Good",
  "Fair",
  "Poor"
];

export default function CreateListingForm({ onBack, onSubmit, isLoading = false }: CreateListingFormProps) {
  const [formData, setFormData] = useState<ListingFormData>({
    title: "",
    description: "",
    price: 0,
    category: "",
    condition: "",
    images: []
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ListingFormData, string>>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (field: keyof ListingFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length + formData.images.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...imageFiles]
    }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ListingFormData, string>> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }
    if (formData.description.length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    }
    if (formData.price <= 0) {
      newErrors.price = "Price must be greater than 0";
    }
    if (!formData.category) {
      newErrors.category = "Category is required";
    }
    if (!formData.condition) {
      newErrors.condition = "Condition is required";
    }
    // Remove this block entirely, or change to a warning (not a blocking error)

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-tan-50 via-brown-50 to-tan-100 p-4">
      <div className="max-w-2xl mx-auto">
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
          <h1 className="text-2xl font-bold text-brown-800">Create New Listing</h1>
        </div>

        <Card className="card-3d bg-gradient-to-br from-tan-50 to-brown-50 border-brown-200/50">
          <CardHeader>
            <CardTitle className="text-brown-800">Listing Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-brown-700">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g., MacBook Pro 13-inch 2020"
                  className="border-brown-300 focus:border-brown-500 bg-tan-50/50"
                  maxLength={100}
                />
                {errors.title && (
                  <p className="text-red-600 text-sm">{errors.title}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-brown-700">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your item in detail..."
                  className="border-brown-300 focus:border-brown-500 bg-tan-50/50 min-h-[100px]"
                  maxLength={1000}
                />
                <div className="flex justify-between text-xs text-brown-500">
                  <span>Minimum 10 characters</span>
                  <span>{formData.description.length}/1000</span>
                </div>
                {errors.description && (
                  <p className="text-red-600 text-sm">{errors.description}</p>
                )}
              </div>

              {/* Price */}
              <div className="space-y-2">
                <Label htmlFor="price" className="text-brown-700">Price (RWF) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price || ''}
                  onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="border-brown-300 focus:border-brown-500 bg-tan-50/50"
                  min="0"
                  step="100"
                />
                {errors.price && (
                  <p className="text-red-600 text-sm">{errors.price}</p>
                )}
              </div>

              {/* Category and Condition */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-brown-700">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger className="border-brown-300 focus:border-brown-500 bg-tan-50/50">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="z-50 bg-tan-50 rounded-md shadow-lg">
                      {CATEGORIES.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-red-600 text-sm">{errors.category}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="condition" className="text-brown-700">Condition *</Label>
                  <Select value={formData.condition} onValueChange={(value) => handleInputChange('condition', value)}>
                    <SelectTrigger className="border-brown-300 focus:border-brown-500 bg-tan-50/50">
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent className="z-50 bg-tan-50 rounded-md shadow-lg">
                      {CONDITIONS.map(condition => (
                        <SelectItem key={condition} value={condition}>
                          {condition}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.condition && (
                    <p className="text-red-600 text-sm">{errors.condition}</p>
                  )}
                </div>
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <Label className="text-brown-700">Images *</Label>
                <div className="space-y-4">
                  {/* Image Preview Grid */}
                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {formData.images.map((file, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border border-brown-200"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upload Button */}
                  {formData.images.length < 5 && (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-brown-300 rounded-lg p-6 text-center hover:border-brown-400 hover:bg-brown-50/50 transition-colors cursor-pointer"
                    >
                      <Camera className="w-8 h-8 text-brown-400 mx-auto mb-2" />
                      <p className="text-brown-600 font-medium">Click to upload images</p>
                      <p className="text-brown-500 text-sm">
                        {formData.images.length}/5 images • Max 5MB each • At least 1 required
                      </p>
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
                {errors.images && (
                  <p className="text-red-600 text-sm">{errors.images}</p>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onBack}
                  className="flex-1 border-brown-300 text-brown-700 hover:bg-brown-100"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-brown-600 to-brown-700 hover:from-brown-700 hover:to-brown-800 button-3d"
                >
                  {isLoading ? "Creating..." : "Create Listing"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 