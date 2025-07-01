
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const NotFound = () => {
    const location = useLocation();

    useEffect(() => {
        console.error(
        "404 Error: User attempted to access non-existent route:",
        location.pathname
        );
    }, [location.pathname]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-tan-50 via-brown-50 to-tan-100 py-12 px-4 sm:px-6 lg:px-8 animate-fade-in">
        <Card className="w-full max-w-md text-center card-3d bg-gradient-to-br from-tan-50 to-brown-50 border-brown-200/50 animate-slide-up">
            <CardHeader className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-brown-100 rounded-full flex items-center justify-center">
                <span className="text-3xl font-bold text-brown-600">404</span>
            </div>
            <CardTitle className="text-2xl font-bold text-brown-800 text-shadow">
                Oops! Page not found
            </CardTitle>
            <CardDescription className="text-brown-600">
                The page you're looking for doesn't exist or has been moved.
            </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
            <div className="space-y-2">
                <Link to="/">
                <Button className="w-full bg-gradient-to-r from-brown-600 to-brown-700 hover:from-brown-700 hover:to-brown-800 button-3d transform hover:scale-105 transition-all duration-300">
                    <Home className="w-4 h-4 mr-2" />
                    Return to Home
                </Button>
                </Link>
                
                <Button 
                variant="outline" 
                onClick={() => window.history.back()}
                className="w-full border-brown-300 text-brown-700 hover:bg-brown-100 transition-all duration-300"
                >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
                </Button>
            </div>
            
            <div className="text-xs text-brown-500 pt-4 border-t border-brown-200/50">
                Error occurred while accessing: <code className="bg-brown-100 px-1 py-0.5 rounded text-brown-700">{location.pathname}</code>
            </div>
            </CardContent>
        </Card>
        </div>
    );
};

export default NotFound;
