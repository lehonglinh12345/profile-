import { Card } from "@/components/ui/card";
import { GraduationCap, BookOpen, Award } from "lucide-react";

export const Japanese = () => {
  const learningPath = [
    {
      level: "JLPT N5",
      status: "Completed",
      icon: Award,
      description: "Basic grammar, hiragana, katakana, and 800 kanji characters",
      color: "from-green-500/20 to-emerald-500/20"
    },
    {
      level: "JLPT N4",
      status: "In Progress",
      icon: BookOpen,
      description: "Intermediate grammar, daily conversations, and 1500 kanji",
      color: "from-blue-500/20 to-cyan-500/20"
    },
    {
      level: "JLPT N3",
      status: "Planning",
      icon: GraduationCap,
      description: "Advanced grammar, business Japanese, and 3000 kanji",
      color: "from-purple-500/20 to-pink-500/20"
    }
  ];

  const skills = [
    { name: "Hiragana & Katakana", level: 100 },
    { name: "Kanji", level: 65 },
    { name: "Grammar", level: 70 },
    { name: "Listening", level: 60 },
    { name: "Speaking", level: 55 },
    { name: "Reading", level: 75 }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-background via-primary/5 to-background">
      <div className="container px-4">
        <div className="max-w-5xl mx-auto space-y-12">
          {/* Section Title */}
          <div className="text-center space-y-4 animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/10 to-primary-glow/10 rounded-full border border-primary/20">
              <span className="text-3xl">🇯🇵</span>
              <span className="text-sm font-medium text-primary">日本語学習中</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold">Japanese Language Journey</h2>
            <p className="text-xl text-muted-foreground">
              Learning Japanese to expand opportunities and cultural understanding
            </p>
          </div>

          {/* Learning Path */}
          <div className="grid md:grid-cols-3 gap-6">
            {learningPath.map((item, index) => {
              const Icon = item.icon;
              return (
                <Card 
                  key={index}
                  className="p-6 space-y-4 hover:shadow-elegant transition-all hover:scale-105 border-border/50 animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={`p-4 rounded-2xl bg-gradient-to-br ${item.color} w-fit`}>
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-1">{item.level}</h3>
                    <div className="inline-flex px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-3">
                      {item.status}
                    </div>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </Card>
              );
            })}
          </div>

          {/* Skills Breakdown */}
          <Card className="p-8 shadow-card border-border/50 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <h3 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              Current Skills
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              {skills.map((skill, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{skill.name}</span>
                    <span className="text-muted-foreground">{skill.level}%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-primary-glow transition-all duration-1000 ease-out"
                      style={{ 
                        width: `${skill.level}%`,
                        animation: 'slide-in 1s ease-out'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Study Resources */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary-glow/5 border-primary/20 animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <h4 className="text-xl font-semibold mb-4">Learning Resources</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full" />
                  Duolingo & Bunpo Apps
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full" />
                  Genki Textbook Series
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full" />
                  Anime & Japanese Media
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full" />
                  Language Exchange Partners
                </li>
              </ul>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary-glow/5 border-primary/20 animate-slide-up" style={{ animationDelay: '0.5s' }}>
              <h4 className="text-xl font-semibold mb-4">Study Schedule</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full" />
                  30 min daily grammar practice
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full" />
                  15 new kanji per week
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full" />
                  Weekly conversation sessions
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full" />
                  Daily listening exercises
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};
