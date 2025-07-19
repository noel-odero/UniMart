
import { useState } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useLogin } from "@/features/auth";

const Login = () => {
    const { mutate, isPending } = useLogin();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        mutate({ email, password });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-tan-50 via-brown-50 to-tan-100 py-12 px-4 sm:px-6 lg:px-8 animate-fade-in">
        <Card className="w-full max-w-md card-3d bg-gradient-to-br from-tan-50 to-brown-50 border-brown-200/50 animate-slide-up">
            <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center text-brown-800 text-shadow">
                Welcome to UniMart
            </CardTitle>
            <CardDescription className="text-center text-brown-600">
                Sign in to your campus marketplace account
            </CardDescription>
            </CardHeader>
            
            <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                <Label htmlFor="email" className="text-brown-700">Campus Email</Label>
                <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-brown-500" />
                    <Input
                    id="email"
                    type="email"
                    placeholder="n.ndinelao@alustudent.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 border-brown-300 focus:border-brown-500 bg-tan-50/50 transition-all duration-300"
                    required
                    />
                </div>
                <p className="text-sm text-brown-500">
                    Use your verified campus email address
                </p>
                </div>

                <div className="space-y-2">
                <Label htmlFor="password" className="text-brown-700">Password</Label>
                <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-brown-500" />
                    <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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

                <div className="flex items-center justify-between text-sm">
                <Link 
                    to="/forgot-password" 
                    className="text-brown-600 hover:text-brown-800 transition-colors duration-300 hover:underline"
                >
                    Forgot password?
                </Link>
                </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
                <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-brown-600 to-brown-700 hover:from-brown-700 hover:to-brown-800 button-3d transform hover:scale-105 transition-all duration-300"
                disabled={isPending}
                >
                {isPending ? "Signing in..." : "Sign In"}
                </Button>
                
                <div className="text-center text-sm text-brown-600">
                Don't have an account?{" "}
                <Link to="/signup" className="text-brown-700 hover:text-brown-800 font-medium transition-colors duration-300 hover:underline">
                    Sign up here
                </Link>
                </div>
            </CardFooter>
            </form>
        </Card>
        </div>
    );
};

export default Login;
