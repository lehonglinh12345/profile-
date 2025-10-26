import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n.use(initReactI18next).init({
  resources: {
    vi: {
      translation: {
        // --- HERO ---
        hero_title: "Lê Linh — レホンリン",
        hero_description:
          "Phát triển website bằng Django, React, và Python. Đam mê công nghệ, kiểm thử phần mềm và học tiếng Nhật 🇯🇵 (JLPT).",
        hero_contact: "Liên hệ với tôi",
        hero_download_cv: "Tải CV",

        // --- ABOUT ---
        about_title: "Về Tôi",
        about_subtitle:
          "Đam mê lập trình, học hỏi và khám phá ngôn ngữ Nhật Bản 🇯🇵",
        about_description:
          "Tôi là một lập trình viên đang phát triển kỹ năng Full Stack với Django, React và Python. Tôi từng thực hiện các dự án thực tế như website xem phim có gợi ý thông minh, chat cộng đồng, đánh giá phim, và ứng dụng học tiếng Nhật với chức năng lưu từ vựng, học ngẫu nhiên và yêu thích. Hiện tôi đang học để thi JLPT N4 và phát triển ứng dụng học tiếng Nhật như một dự án cá nhân để luyện tập và giúp đỡ người học khác. Tôi yêu thích công nghệ, ngôn ngữ, và luôn tìm cách kết hợp chúng để tạo ra những sản phẩm hữu ích và sáng tạo.",
        highlight_1_title: "Web Developer",
        highlight_1_desc: "Xây dựng website bằng Django và Python.",
        highlight_2_title: "Machine Learning & Gợi Ý",
        highlight_2_desc:
          "Ứng dụng Machine Learning và Content-Based Filtering để gợi ý phim thông minh.",
        highlight_3_title: "Học Tiếng Nhật",
        highlight_3_desc:
          "Tự học tiếng Nhật (JLPT N4) và phát triển app học từ vựng, luyện thi bằng React Native.",
        highlight_4_title: "Không Ngừng Học Hỏi",
        highlight_4_desc:
          "Luôn cập nhật kiến thức mới trong lập trình và kiểm thử phần mềm.",
      },
    },

    en: {
      translation: {
        // --- HERO ---
        hero_title: "Le Linh — レホンリン",
        hero_description:
          "Developing web using Django, React, and Python. Passionate about technology, software testing, and learning Japanese 🇯🇵 (JLPT N4).",
        hero_contact: "Get In Touch",
        hero_download_cv: "Download CV",

        // --- ABOUT ---
        about_title: "About Me",
        about_subtitle:
          "Passionate about coding, learning, and exploring the Japanese language 🇯🇵",
        about_description:
          "I am a developer growing my Full Stack skills with Django, React, and Python. I’ve built real-world projects like a movie website with smart recommendations, community chat, and movie ratings — and a Japanese learning app with vocabulary storage, random learning, and favorites. I’m currently studying for JLPT N4 and developing my own learning app to both practice and help others. I love technology, languages, and finding creative ways to combine them.",
        highlight_1_title: "Web Developer",
        highlight_1_desc: "Building websites using Django and Python.",
        highlight_2_title: "Machine Learning & Recommendation",
        highlight_2_desc:
          "Applying Machine Learning and Content-Based Filtering for intelligent movie recommendations.",
        highlight_3_title: "Japanese Learning",
        highlight_3_desc:
          "Self-studying Japanese (JLPT N4) and developing a React Native app for vocabulary practice.",
        highlight_4_title: "Continuous Learning",
        highlight_4_desc:
          "Always updating knowledge in programming and software testing.",
      },
    },

    ja: {
      translation: {
        // --- HERO ---
        hero_title: "レ・リン — レホンリン",
        hero_description:
          "Django、React、Python を使用してウェブを開発。技術、ソフトウェアテスト、日本語学習 🇯🇵（JLPT N4）に情熱を持っています。",
        hero_contact: "お問い合わせ",
        hero_download_cv: "履歴書をダウンロード",

        // --- ABOUT ---
        about_title: "私について",
        about_subtitle:
          "プログラミングと言語学習、日本語 🇯🇵 に情熱を持っています。",
        about_description:
          "私は Django、React、Python を使用してフルスタックスキルを磨いている開発者です。スマートな映画推薦、コミュニティチャット、映画評価のある映画サイトや、語彙保存・ランダム学習・お気に入り機能付きの日本語学習アプリなどを制作しました。現在は JLPT N4 を目指して勉強中で、自分自身の学習アプリを開発し、他の学習者にも役立つようにしています。技術と言語を組み合わせ、創造的で役立つ製品を作ることが大好きです。",
        highlight_1_title: "Web・モバイル開発者",
        highlight_1_desc: "Django、Python を使ってウェブサイトを構築。",
        highlight_2_title: "機械学習と推薦システム",
        highlight_2_desc:
          "機械学習とコンテンツベースフィルタリングを用いて映画を賢く推薦。",
        highlight_3_title: "日本語学習",
        highlight_3_desc:
          "独学で日本語（JLPT N4）を勉強し、React Nativeで語彙学習アプリを開発。",
        highlight_4_title: "絶え間ない学習",
        highlight_4_desc:
          "プログラミングとソフトウェアテストの知識を常に更新。",
      },
    },
  },

  lng: "vi", // Ngôn ngữ mặc định
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
