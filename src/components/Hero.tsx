import { Button } from "@/components/ui/button";
import { Github,  Mail, Download, Facebook } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";
import "../i18n";
import { useTranslation } from "react-i18next";
import { Typewriter } from 'react-simple-typewriter';





export const Hero = () => {
  const { t } = useTranslation();

  const openGmail = () => {
    window.open(
      "https://mail.google.com/mail/?view=cm&to=lehonglinhcd2004@gmail.com",
      "_blank"
    );
  };
  


  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroBg} 
          alt="Hero background" 
          className="w-full h-full object-cover opacity-50 dark:opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background/90 to-background/95 dark:from-primary/10 dark:via-background/85 dark:to-background/90" />
        <div className="absolute top-20 left-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary-glow/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      </div>

      {/* Content */}
      <div className="container relative z-10 px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          
          {/* Avatar */}
<div className="inline-block p-1 rounded-full bg-gradient-to-br from-primary to-primary-glow shadow-elegant">
  <div className="w-32 h-32 rounded-full bg-secondary flex items-center justify-center overflow-hidden group">
    <img
      src="avatar/avt.png"
      alt="Avatar"
      className="w-full h-full object-cover rounded-full transition-transform duration-700 ease-in-out group-hover:scale-125 group-hover:brightness-110"

    />
  </div>
</div>


          {/* Title */}
          <div className="space-y-4">
<h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-primary-glow to-primary bg-clip-text text-transparent">
  <div className="min-h-[4rem] md:min-h-[10rem] "> 
    <Typewriter
      words={[
        "Lê Linh — レホンリン",
        "React & Django Developer",
        "Chào mừng bạn đến với trang cá nhân của tôi!",
      ]}
      loop={0}
      cursor
      cursorStyle="_"
      typeSpeed={100}
      deleteSpeed={50}
      delaySpeed={1500}
    />
  </div>
</h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              {t("hero_description")}
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4 justify-center pt-4">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 transition-all shadow-elegant"
              onClick={openGmail}
            >
              <Mail className="mr-2 h-5 w-5" />
              {t("hero_contact")}
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-primary/30 hover:bg-primary/10 transition-all"
              onClick={() => window.open("/cv_lelinh.pdf", "_blank")}
            >
              <Download className="mr-2 h-5 w-5" />
              {t("hero_download_cv")}
            </Button>
          </div>

          {/* Social Links */}
          <div className="flex gap-4 justify-center pt-8">
  <a 
    href="https://github.com/lehonglinh12345" 
    target="_blank" 
    rel="noopener noreferrer"
    className="p-3 rounded-full bg-card border border-border hover:border-primary hover:bg-primary/10 transition-all shadow-card"
    title="GitHub"
  >
    <Github className="h-5 w-5" />
  </a>

  <a 
    href="https://www.facebook.com/re.hon.rin.2025?mibextid=wwXIfr&rdid=6yl1jmw2ruRP07u1&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1GSWHpf8Zj%2F%3Fmibextid%3DwwXIfr" 
    target="_blank" 
    rel="noopener noreferrer"
    className="p-3 rounded-full bg-card border border-border hover:border-primary hover:bg-primary/10 transition-all shadow-card"
    title="Facebook"
  >
    <Facebook className="h-5 w-5" />
  </a>

  <button
    onClick={openGmail}
    className="p-3 rounded-full bg-card border border-border hover:border-primary hover:bg-primary/10 transition-all shadow-card"
    title="Email"
  >
    <Mail className="h-5 w-5" />
  </button>
</div>

        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-primary/50 rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-primary rounded-full" />
        </div>
      </div>
    </section>
  );
};
