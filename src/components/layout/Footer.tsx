
import React from 'react';
import { Code, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-white/10 bg-background/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-neon-purple to-neon-blue p-2 rounded-lg">
              <Code className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-neon-purple to-neon-blue bg-clip-text text-transparent">
              CYW - Code Your Way
            </span>
          </div>
          
          <div className="flex items-center space-x-2 text-muted-foreground">
            <span>Designed and Developed with</span>
            <Heart className="h-4 w-4 text-red-500 fill-current" />
            <span>by <span className="font-semibold text-foreground">PJ</span></span>
          </div>
          
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} CYW Platform. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
