import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { Skills } from "@/components/Skills";
import { Experience } from "@/components/Experience";
import { Japanese } from "@/components/Japanese";
import { Projects } from "@/components/Projects";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import { ChatBot } from "@/components/ChatBot";
import { ThemeToggle } from "@/components/ThemeToggle";
import "../i18n";
import { useTranslation } from "react-i18next";

const Index = () => {
  const { i18n } = useTranslation();

  return (
    <div className="min-h-screen relative">
      {/* Góc trên bên phải */}
      <div className="absolute top-20 right-4 flex items-center gap-2 z-50">
        <ThemeToggle />

        {/* Bộ chọn ngôn ngữ */}
        <select
          onChange={(e) => i18n.changeLanguage(e.target.value)}
          defaultValue={i18n.language}
          className="bg-secondary text-foreground border border-border px-2 py-1 rounded-md text-sm focus:outline-none"
        >
          <option value="vi">🇻🇳 VN</option>
          <option value="en">🇬🇧 EN</option>
          <option value="ja">🇯🇵 JP</option>
        </select>
      </div>

      {/* Các phần chính */}
      <Hero />
      <About />
      <Skills />
      <Experience />
      <Japanese />
      <Projects />
      <Contact />
      <Footer />
      <ChatBot />
    </div>
  );
};

export default Index;
