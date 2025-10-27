import { Card } from "@/components/ui/card";
import { Briefcase, GraduationCap } from "lucide-react";

export const Experience = () => {
  const experiences = [
    {
      type: "work",
      title: "Full Stack Developer (Python & Django)",
      company: "Dự án Web Xem Phim",
      period: "2024 - 2025",
      description:
        "Phát triển website xem phim với các tính năng: đánh giá, gợi ý theo nội dung (Content-Based Filtering), lưu lịch sử xem, yêu thích, và chat cộng đồng. Sử dụng Django, WebSocket và SwiperJS."
    },
    // {
    //   type: "work",
    //   title: "Frontend Developer (React Native)",
    //   company: "Dự án App Học Tiếng Nhật",
    //   period: "2025",
    //   description:
    //     "Xây dựng ứng dụng học từ vựng tiếng Nhật với các chức năng: học từ ngẫu nhiên, lưu tiến độ bằng AsyncStorage, yêu thích từ vựng, và build file .apk để chạy trên điện thoại."
    // },
    {
      type: "work",
      title: "Tester / QA Engineer",
      company: "Dự án Kiểm thử Phần mềm",
      period: "2024 - 2025",
      description:
        "Thực hiện kiểm thử phần mềm bằng Katalon Studio và Selenium. Viết Test Plan, Test Case, Mapping, Test Report cho các dự án: 'Giải phương trình', 'Tính chu vi – diện tích', và 'Website bán hàng'."
    },
    {
      type: "education",
      title: "Sinh viên ngành Kỹ Thuật Phần Mềm",
      company: "Trường Đại học ( CTUET ) ",
      period: "2025 - Nay",
      description:
        "Học và phát triển kỹ năng lập trình web và kiểm thử phần mềm. Tập trung vào Django, Reactjs , Nodejs , Python, và kiểm thử phần mềm theo quy trình ISO/IEC/IEEE 29119."
    }
  ];

  return (
    <section id="experience" className="py-20 bg-gradient-to-b from-secondary/30 to-background">
      <div className="container px-4">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Section Title */}
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold">Kinh nghiệm & Học vấn</h2>
            <p className="text-xl text-muted-foreground">
              Hành trình học tập và phát triển kỹ năng lập trình của tôi
            </p>
          </div>

          {/* Timeline */}
          <div className="space-y-8">
            {experiences.map((exp, index) => (
              <div key={index} className="relative">
                {/* Timeline line */}
                {index !== experiences.length - 1 && (
                  <div className="absolute left-6 top-16 bottom-0 w-0.5 bg-gradient-to-b from-primary to-transparent md:left-8" />
                )}
                
                <Card className="p-6 md:p-8 shadow-card border-border/50 hover:shadow-elegant transition-all">
                  <div className="flex gap-4 md:gap-6">
                    {/* Icon */}
                    <div className="flex-shrink-0">
                      <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-primary-glow/20">
                        {exp.type === "work" ? (
                          <Briefcase className="h-6 w-6 text-primary" />
                        ) : (
                          <GraduationCap className="h-6 w-6 text-primary" />
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-3">
                      <div>
                        <h3 className="text-xl md:text-2xl font-semibold">{exp.title}</h3>
                        <div className="flex flex-wrap gap-2 mt-2 text-muted-foreground">
                          <span className="font-medium text-primary">{exp.company}</span>
                          <span>•</span>
                          <span>{exp.period}</span>
                        </div>
                      </div>
                      <p className="text-foreground/80 leading-relaxed">
                        {exp.description}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
