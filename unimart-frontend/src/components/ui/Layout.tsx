import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, User, Home, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useGetMe } from "@/features/auth";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const navigation = [
    { name: "Home", href: "/", icon: Home },
    { name: "Browse", href: "/browse", icon: ShoppingBag },
    { name: "Dashboard", href: "/dashboard", icon: User },
  ];

  const { data } = useGetMe();
  const noUser = !data?.user

  const handleLogout = () => {
    logout();
    navigate("/");
  }
  // const user = userData?
  return (
    <div className="min-h-screen bg-gradient-to-br from-tan-50 via-brown-50 to-tan-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-brown-100/80 to-tan-100/80 backdrop-blur-md shadow-lg border-b border-brown-200/50 navbar-3d">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center transform hover:scale-105 transition-all duration-300"
            >
              <div className="text-2xl font-bold text-brown-700 text-shadow animate-float">
                UniMart
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                      location.pathname === item.href
                        ? "text-brown-800 bg-tan-200/70 shadow-md"
                        : "text-brown-600 hover:text-brown-800 hover:bg-tan-100/50 hover:shadow-md"
                    }`, noUser && item.href === "/dashboard" && "hidden")}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Desktop Auth Actions */}
            <div className="hidden md:flex items-center space-x-4">
              {data?.user ? (
                <>
                
                <Link
                  to="/dashboard"
                  className="text-brown-600 hover:text-brown-800 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-tan-100/50"
                >
                  {data?.user.fullName}
                </Link>
                <button onClick={handleLogout} className="text-brown-600 hover:text-brown-800 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-tan-100/50">
                  Logout
                </button>
                
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-brown-600 hover:text-brown-800 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-tan-100/50"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="bg-gradient-to-r from-brown-600 to-brown-700 text-tan-50 px-6 py-2 rounded-lg text-sm font-medium hover:from-brown-700 hover:to-brown-800 transition-all duration-300 button-3d transform hover:scale-105"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-brown-600 hover:text-brown-800 hover:bg-tan-100/50 transition-all duration-300"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t bg-gradient-to-r from-brown-100/90 to-tan-100/90 backdrop-blur-md animate-slide-up">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center px-3 py-2 rounded-lg text-base font-medium transition-all duration-300 ${
                      location.pathname === item.href
                        ? "text-brown-800 bg-tan-200/70"
                        : "text-brown-600 hover:text-brown-800 hover:bg-tan-100/50"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </Link>
                );
              })}
              <div className="border-t border-brown-200/50 pt-4 mt-4">
                <Link
                  to="/login"
                  className="block px-3 py-2 rounded-lg text-base font-medium text-brown-600 hover:text-brown-800 hover:bg-tan-100/50 transition-all duration-300"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="block px-3 py-2 rounded-lg text-base font-medium bg-gradient-to-r from-brown-600 to-brown-700 text-tan-50 hover:from-brown-700 hover:to-brown-800 mt-2 transition-all duration-300"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-brown-100 to-tan-100 border-t border-brown-200/50 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-brown-600">
            <p className="text-shadow">
              &copy; 2025 UniMart. Empowering campus communities across Africa.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
