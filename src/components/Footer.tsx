import { Github, Linkedin, Mail, Heart } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="py-12 bg-card border-t border-border">
      <div className="container px-4">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Social Links */}
          <div className="flex justify-center gap-6">
            <a 
              href="#" 
              className="p-3 rounded-full bg-secondary hover:bg-primary/10 hover:text-primary transition-all"
            >
              <Github className="h-5 w-5" />
            </a>
            <a 
              href="#" 
              className="p-3 rounded-full bg-secondary hover:bg-primary/10 hover:text-primary transition-all"
            >
              <Linkedin className="h-5 w-5" />
            </a>
            <a 
              href="#" 
              className="p-3 rounded-full bg-secondary hover:bg-primary/10 hover:text-primary transition-all"
            >
              <Mail className="h-5 w-5" />
            </a>
          </div>

          {/* Copyright */}
          <div className="text-center text-muted-foreground">
            <p className="flex items-center justify-center gap-2">
              Made with <Heart className="h-4 w-4 text-primary fill-primary" /> by Your Name
            </p>
            <p className="text-sm mt-2">© {new Date().getFullYear()} All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
