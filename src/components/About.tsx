import { Card } from "@/components/ui/card";
import { Code, Brain, Rocket, BookOpen } from "lucide-react";
import "../i18n";
import { useTranslation } from "react-i18next";

export const About = () => {
  const { t } = useTranslation();

  const highlights = [
    {
      icon: Code,
      title: t("highlight_1_title"),
      description: t("highlight_1_desc"),
    },
    {
      icon: Brain,
      title: t("highlight_2_title"),
      description: t("highlight_2_desc"),
    },
    {
      icon: BookOpen,
      title: t("highlight_3_title"),
      description: t("highlight_3_desc"),
    },
    {
      icon: Rocket,
      title: t("highlight_4_title"),
      description: t("highlight_4_desc"),
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-background via-secondary/20 to-background relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary-glow/5 rounded-full blur-3xl" />
      </div>
      
      <div className="container px-4 relative z-10">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Section Title */}
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold">
              {t("about_title")}
            </h2>
            <p className="text-xl text-muted-foreground">
              {t("about_subtitle")}
            </p>
          </div>

          {/* Description */}
          <Card className="p-8 shadow-elegant border-primary/10 bg-gradient-card relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-shine opacity-0 group-hover:opacity-100 transition-opacity group-hover-shine" />
            <p className="text-lg leading-relaxed text-foreground/90 relative z-10">
              {t("about_description")}
            </p>
          </Card>

          {/* Highlights Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {highlights.map((item, index) => {
              const Icon = item.icon;
              return (
                <Card 
                  key={index} 
                  className="p-6 text-center space-y-4 hover:shadow-glow transition-all hover:scale-105 border-primary/20 bg-gradient-card group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-shine opacity-0 group-hover:opacity-100 transition-opacity" style={{ animation: 'shine 0.8s ease-in-out' }} />
                  <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-primary-glow/20 relative z-10 group-hover:scale-110 transition-transform">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
