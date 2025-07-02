
import { useState } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Lock, User, School, Eye, EyeOff } from "lucide-react";

const Signup = () => {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        university: "",
        password: "",
        confirmPassword: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const universities = [
        "African Leadership University",
        "University of Rwanda",
        "UGHE",
        "AUCA",
        "Carnegie Mellon University",
        "Other"
    ];

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (formData.password !== formData.confirmPassword) {
        alert("Passwords don't match!");
        return;
        }
        
        setIsLoading(true);
        
        // TODO: Implement signup logic with Supabase
        console.log("Signup attempt:", formData);
        
        // Simulate API call
        setTimeout(() => {
        setIsLoading(false);
        }, 1000);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-tan-50 via-brown-50 to-tan-100 py-12 px-4 sm:px-6 lg:px-8 animate-fade-in">
        <Card className="w-full max-w-md card-3d bg-gradient-to-br from-tan-50 to-brown-50 border-brown-200/50 animate-slide-up">
            <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center text-brown-800 text-shadow">
                Join UniMart
            </CardTitle>
            <CardDescription className="text-center text-brown-600">
                Create your campus marketplace account
            </CardDescription>
            </CardHeader>
            
            <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                <Label htmlFor="fullName" className="text-brown-700">Full Name</Label>
                <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-brown-500" />
                    <Input
                    id="fullName"
                    type="text"
                    placeholder="Ndinelao Iitumba"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                    className="pl-10 border-brown-300 focus:border-brown-500 bg-tan-50/50 transition-all duration-300"
                    required
                    />
                </div>
                </div>

                <div className="space-y-2">
                <Label htmlFor="university" className="text-brown-700">University</Label>
                <div className="relative">
                    <School className="absolute left-3 top-3 h-4 w-4 text-brown-500 z-10" />
                    <Select onValueChange={(value) => handleInputChange("university", value)}>
                    <SelectTrigger className="pl-10 border-brown-300 focus:border-brown-500 bg-tan-50/50 transition-all duration-300">
                        <SelectValue placeholder="Select your university" />
                    </SelectTrigger>
                    <SelectContent className="z-50 bg-tan-50 rounded-md shadow-lg">
                        {universities.map((uni) => (
                        <SelectItem key={uni} value={uni}>
                            {uni}
                        </SelectItem>
                        ))}
                    </SelectContent>
                    </Select>
                </div>
                </div>

                <div className="space-y-2">
                <Label htmlFor="email" className="text-brown-700">Campus Email</Label>
                <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-brown-500" />
                    <Input
                    id="email"
                    type="email"
                    placeholder="your.name@university.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="pl-10 border-brown-300 focus:border-brown-500 bg-tan-50/50 transition-all duration-300"
                    required
                    />
                </div>
                <p className="text-sm text-brown-500">
                    Must be a valid campus email address
                </p>
                </div>

                <div className="space-y-2">
                <Label htmlFor="password" className="text-brown-700">Password</Label>
                <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-brown-500" />
                    <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className="pl-10 pr-10 border-brown-300 focus:border-brown-500 bg-tan-50/50 transition-all duration-300"
                    required
                    />
                    <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-brown-500 hover:text-brown-700 transition-colors duration-300"
                    >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                </div>
                </div>

                <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-brown-700">Confirm Password</Label>
                <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-brown-500" />
                    <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    className="pl-10 pr-10 border-brown-300 focus:border-brown-500 bg-tan-50/50 transition-all duration-300"
                    required
                    />
                    <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-brown-500 hover:text-brown-700 transition-colors duration-300"
                    >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                </div>
                </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
                <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-brown-600 to-brown-700 hover:from-brown-700 hover:to-brown-800 button-3d transform hover:scale-105 transition-all duration-300"
                disabled={isLoading}
                >
                {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
                
                <div className="text-center text-sm text-brown-600">
                Already have an account?{" "}
                <Link to="/login" className="text-brown-700 hover:text-brown-800 font-medium transition-colors duration-300 hover:underline">
                    Sign in here
                </Link>
                </div>
            </CardFooter>
            </form>
        </Card>
        </div>
    );
};

export default Signup;
