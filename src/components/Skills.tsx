import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export const Skills = () => {
  const skillCategories = [
    {
      category: "Frontend",
      skills: [
        { name: "React ", level: 40 },
        { name: "TypeScript / JavaScript", level: 85 },
        { name: "Tailwind CSS", level: 90 },
        { name: "HTML / CSS", level: 95 }
      ]
    },
    {
      category: "Backend",
      skills: [
        { name: "Node.js / Express", level: 25 },
        { name: "Xampp/MySql", level: 80 },
        { name: "Python/Django", level: 80 },
      ]
    },
    {
      category: "Tools & Others",
      skills: [
        { name: "Git / GitHub", level: 90 },
        { name: "Figma / Design", level: 80 },
        { name: "Testing ", level: 85 }
      ]
    }
  ];

  return (
    <section id="skill" className="py-20 bg-background">
      <div className="container px-4">
        <div className="max-w-5xl mx-auto space-y-12">
          {/* Section Title */}
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold">Skills & Expertise</h2>
            <p className="text-xl text-muted-foreground">
              Technologies I work with on a daily basis
            </p>
          </div>

          {/* Skills Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {skillCategories.map((category, catIndex) => (
              <Card key={catIndex} className="p-6 space-y-6 shadow-elegant border-primary/10 bg-gradient-card hover:shadow-glow transition-all group">
                <h3 className="text-2xl font-semibold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">{category.category}</h3>
                <div className="space-y-5">
                  {category.skills.map((skill, skillIndex) => (
                    <div key={skillIndex} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{skill.name}</span>
                        <span className="text-muted-foreground">{skill.level}%</span>
                      </div>
                      <Progress value={skill.level} className="h-2" />
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
