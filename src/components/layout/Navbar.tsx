
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Code, User, Settings, LogOut, Menu, X, Palette } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const NavLinks = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      <Link
        to="/problems"
        className={`transition-colors hover:text-neon-purple ${mobile ? 'block py-2' : ''}`}
        onClick={() => mobile && setMobileMenuOpen(false)}
      >
        Problems
      </Link>
      {isAuthenticated && (
        <>
          <Link
            to="/submissions"
            className={`transition-colors hover:text-neon-blue ${mobile ? 'block py-2' : ''}`}
            onClick={() => mobile && setMobileMenuOpen(false)}
          >
            Submissions
          </Link>
          <Link
            to="/dashboard"
            className={`transition-colors hover:text-neon-green ${mobile ? 'block py-2' : ''}`}
            onClick={() => mobile && setMobileMenuOpen(false)}
          >
            Dashboard
          </Link>
          {isAdmin && (
            <Link
              to="/admin"
              className={`transition-colors hover:text-neon-pink ${mobile ? 'block py-2' : ''}`}
              onClick={() => mobile && setMobileMenuOpen(false)}
            >
              Admin
            </Link>
          )}
        </>
      )}
    </>
  );

  return (
    <nav className="glass-strong border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="bg-gradient-to-r from-neon-purple to-neon-blue p-2 rounded-lg group-hover:scale-110 transition-transform">
              <Code className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-neon-purple to-neon-blue bg-clip-text text-transparent">
              CYW
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLinks />
          </div>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Theme Toggle */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={toggleTheme}
              className="text-muted-foreground hover:text-foreground"
            >
              <Palette className="h-4 w-4" />
            </Button>

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8 border border-white/20">
                      <AvatarFallback className="bg-gradient-to-r from-neon-purple to-neon-blue text-white">
                        {user?.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="glass-strong border border-white/20" align="end">
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="space-x-4">
                <Button variant="ghost" onClick={() => navigate('/login')}>
                  Login
                </Button>
                <Button onClick={() => navigate('/register')}>
                  Sign Up
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10">
            <div className="flex flex-col space-y-2">
              <NavLinks mobile />
              
              {/* Theme Toggle Mobile */}
              <Button 
                variant="ghost" 
                onClick={toggleTheme}
                className="justify-start"
              >
                <Palette className="mr-2 h-4 w-4" />
                Switch Theme ({theme === 'dark' ? 'Cyberpunk' : 'Dark'})
              </Button>

              {isAuthenticated ? (
                <div className="pt-4 border-t border-white/10 mt-4">
                  <div className="flex items-center space-x-3 mb-4">
                    <Avatar className="h-8 w-8 border border-white/20">
                      <AvatarFallback className="bg-gradient-to-r from-neon-purple to-neon-blue text-white">
                        {user?.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-muted-foreground">{user?.email}</span>
                  </div>
                  <Button variant="ghost" className="w-full justify-start" onClick={() => navigate('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="pt-4 border-t border-white/10 mt-4 space-y-2">
                  <Button variant="ghost" className="w-full" onClick={() => navigate('/login')}>
                    Login
                  </Button>
                  <Button className="w-full" onClick={() => navigate('/register')}>
                    Sign Up
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
