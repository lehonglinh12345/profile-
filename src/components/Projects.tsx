import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Github } from "lucide-react";

export const Projects = () => {
  const projects = [
    {
      title: "🎬 Web Xem Phim Django",
      description:
        "Website xem phim có đăng nhập, đánh giá, gợi ý theo nội dung và hành vi, lưu lịch sử xem, yêu thích, và chat cộng đồng thời gian thực.",
      tags: ["Django", "MySql","WebSocket", "HTML/CSS/JS"],
      live: "https://example-movieapp.vercel.app", // link demo thật nếu có
      code: "https://github.com/yourusername/django-movie-web",
      image: "🎞️",
    },
    {
      title: "💬 Web Đồ Án & Chat Realtime",
      description:
        "Ứng dụng chat cộng đồng đơn giản, sử dụng Next.js và WebSocket với emoji, avatar, hiển thị trạng thái đang nhập và chống spam.",
      tags: [ "WebSocket", "TailwindCSS", "Node.js"],
      live: "https://example-chatapp.vercel.app",
      code: "https://github.com/lehonglinh12345/DA",
      image: "💭",
    },
    {
      title: "📱 App Học Tiếng Nhật",
      description:
        "Ứng dụng học từ vựng tiếng Nhật N5–N4 bằng React Native. Có tính năng yêu thích từ, học ngẫu nhiên, lưu bằng AsyncStorage, build file .apk.",
      tags: ["React Native", "Expo", "SQLite"],
      live: "",
      code: "https://github.com/yourusername/japanese-learning-app",
      image: "🇯🇵",
    },
    {
      title: "🧮 Phần Mềm Giải Phương Trình",
      description:
        "Phần mềm desktop tính chu vi, diện tích và giải phương trình bậc 1, 2. Kiểm thử bằng Katalon Studio, tạo Testcase, Mapping, và Test Report.",
      tags: ["Katalon Studio", "Selenium", "Excel Mapping", "QA Testing"],
      live: "",
      code: "https://github.com/yourusername/software-testing-project",
      image: "🧩",
    },
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container px-4">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Section Title */}
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold">My Projects</h2>
            <p className="text-xl text-muted-foreground">
              Những dự án tiêu biểu tôi đã thực hiện
            </p>
          </div>

          {/* Projects Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {projects.map((project, index) => (
              <Card
                key={index}
                className="overflow-hidden shadow-elegant border-primary/10 hover:shadow-glow transition-all group bg-gradient-card"
              >
                {/* Project Image/Icon */}
                <div className="h-48 bg-gradient-to-br from-primary/20 via-primary-glow/10 to-transparent flex items-center justify-center text-7xl group-hover:scale-110 transition-transform relative overflow-hidden">
                  <div
                    className="absolute inset-0 bg-gradient-shine opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ animation: "shine 1s ease-in-out" }}
                  />
                  <span className="relative z-10">{project.image}</span>
                </div>

                {/* Project Content */}
                <div className="p-6 space-y-4">
                  <h3 className="text-2xl font-semibold">{project.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {project.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="px-3 py-1 text-sm rounded-full bg-primary/10 text-primary border border-primary/20"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-2">
                    {project.live && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-primary/30 hover:bg-primary/10"
                        asChild
                      >
                        <a href={project.live} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Live Demo
                        </a>
                      </Button>
                    )}
                    {project.code && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-primary/30 hover:bg-primary/10"
                        asChild
                      >
                        <a href={project.code} target="_blank" rel="noopener noreferrer">
                          <Github className="mr-2 h-4 w-4" />
                          Code
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
