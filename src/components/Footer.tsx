import { Github, Mail, Heart } from "lucide-react";
import { FaFacebook } from "react-icons/fa"; // thêm icon Facebook

export const Footer = () => {
  return (
    <footer className="py-12 bg-card border-t border-border">
      <div className="container px-4">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Social Links */}
          <div className="flex justify-center gap-6">
            {/* GitHub */}
            <a 
              href="https://github.com/lehonglinh12345" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-3 rounded-full bg-secondary hover:bg-primary/10 hover:text-primary transition-all"
            >
              <Github className="h-5 w-5" />
            </a>

            {/* Facebook */}
            <a 
              href="https://www.facebook.com/re.hon.rin.2025?mibextid=wwXIfr&rdid=6yl1jmw2ruRP07u1&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1GSWHpf8Zj%2F%3Fmibextid%3DwwXIfr"
              target="_blank" 
              rel="noopener noreferrer"
              className="p-3 rounded-full bg-secondary hover:bg-primary/10 hover:text-primary transition-all"
            >
              <FaFacebook className="h-5 w-5" />
            </a>

            {/* Email */}
            <a 
              href="mailto:yourmail@gmail.com" 
              className="p-3 rounded-full bg-secondary hover:bg-primary/10 hover:text-primary transition-all"
            >
              <Mail className="h-5 w-5" />
            </a>
          </div>

          {/* Copyright */}
          <div className="text-center text-muted-foreground">
            <p className="flex items-center justify-center gap-2">
              Made with <Heart className="h-4 w-4 text-primary fill-primary" /> by <span className="font-semibold text-foreground">Lê Hồng Lĩnh</span>
            </p>
            <p className="text-sm mt-2">© {new Date().getFullYear()} All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
