import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ShoppingBag, Users, Shield, Smartphone } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

const features = [
  {
    icon: ShoppingBag,
    title: "Campus Marketplace",
    description:
      "Buy and sell items safely within your verified campus community",
  },
  {
    icon: Users,
    title: "Student Community",
    description:
      "Connect with fellow students and build trusted relationships",
  },
  {
    icon: Shield,
    title: "Secure Platform",
    description:
      "Campus email verification and user ratings ensure safe transactions",
  },
  {
    icon: Smartphone,
    title: "Mobile Friendly",
    description: "Access UniMart anywhere on your phone, tablet, or computer",
  },
];

const stats = [
  { label: "Active Students", value: "500+" },
  { label: "Items Sold", value: "1,200+" },
  { label: "Universities", value: "25+" },
  { label: "Success Rate", value: "98%" },
];

const Index = () => {
  const { user } = useAuth();


  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-tan-50 via-brown-50 to-tan-100 py-20 animate-fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-brown-800 mb-6 text-shadow animate-slide-up">
            Your Campus
            <span className="text-brown-600 animate-float"> Marketplace</span>
          </h1>
          <p
            className="text-xl text-brown-600 mb-8 max-w-3xl mx-auto animate-slide-up"
            style={{ animationDelay: "0.2s" }}
          >
            Buy, sell, and trade with fellow students in your university
            community. Safe, simple, and tailored for African campuses.
          </p>
          <div
            className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up"
            style={{ animationDelay: "0.4s" }}
          >
            <Button
              asChild
              size="lg"
              className="text-lg px-8 py-3 bg-gradient-to-r from-brown-600 to-brown-700 hover:from-brown-700 hover:to-brown-800 button-3d transform hover:scale-105"
            >
              <Link to="/signup">Get Started</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="text-lg px-8 py-3 border-brown-300 text-brown-700 hover:bg-tan-100 button-3d transform hover:scale-105"
            >
              <Link to="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-brown-100/50 to-tan-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center transform hover:scale-110 transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-3xl md:text-4xl font-bold text-brown-700 mb-2 text-shadow">
                  {stat.value}
                </div>
                <div className="text-brown-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-tan-100/50 to-brown-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-3xl md:text-4xl font-bold text-brown-800 mb-4 text-shadow">
              Why Choose UniMart?
            </h2>
            <p className="text-xl text-brown-600 max-w-2xl mx-auto">
              Designed specifically for African university students, by students
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={index}
                  className="text-center card-3d bg-gradient-to-br from-tan-50 to-brown-50 border-brown-200/50 animate-slide-up"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <CardHeader>
                    <div
                      className="w-16 h-16 bg-gradient-to-br from-brown-200 to-tan-200 rounded-full flex items-center justify-center mx-auto mb-4 animate-float"
                      style={{ animationDelay: `${index * 0.5}s` }}
                    >
                      <Icon className="w-8 h-8 text-brown-700" />
                    </div>
                    <CardTitle className="text-xl text-brown-800">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base text-brown-600">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-brown-600 to-brown-700 animate-fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-tan-50 mb-4 text-shadow animate-slide-up">
            Ready to Start Trading?
          </h2>
          <p
            className="text-xl text-tan-100 mb-8 max-w-2xl mx-auto animate-slide-up"
            style={{ animationDelay: "0.2s" }}
          >
            Join thousands of students already buying and selling on UniMart
          </p>
          <Button
            asChild
            size="lg"
            variant="secondary"
            className="text-lg px-8 py-3 bg-tan-100 text-brown-800 hover:bg-tan-200 button-3d transform hover:scale-105 animate-slide-up"
            style={{ animationDelay: "0.4s" }}
          >
            <Link to="/signup">Create Your Account</Link>
          </Button>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-br from-tan-50 to-brown-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-3xl md:text-4xl font-bold text-brown-800 mb-4 text-shadow">
              How It Works
            </h2>
            <p className="text-xl text-brown-600">
              Simple steps to start trading
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: 1,
                title: "Sign Up",
                description:
                  "Create your account using your campus email address",
              },
              {
                step: 2,
                title: "List or Browse",
                description:
                  "Post items for sale or browse what others are offering",
              },
              {
                step: 3,
                title: "Connect & Trade",
                description:
                  "Message buyers/sellers and complete your transactions safely",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="text-center animate-slide-up"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div
                  className="w-16 h-16 bg-gradient-to-br from-brown-600 to-brown-700 text-tan-50 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold transform hover:scale-110 transition-all duration-300 animate-float"
                  style={{ animationDelay: `${index * 0.5}s` }}
                >
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-brown-800">
                  {item.title}
                </h3>
                <p className="text-brown-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
