import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageCircle, X, Send, Loader2, User, Bot, ExternalLink, Smile, Sparkles, MousePointer, Upload, FileText, Image as ImageIcon } from "lucide-react";
import Picker from "emoji-picker-react"; // npm install emoji-picker-react
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils"; // Giả sử bạn có cn utility từ shadcn

interface Message {
  role: "user" | "assistant";
  content: string;
  file?: { 
    name: string; 
    content?: string; 
    url?: string; 
    type?: string; // Thêm type để phân biệt image/file
  }; // Thêm file attachment với type
  timestamp?: Date;
}

interface ContextState {
  topic: string | null;
  lastUserQuery: string | null;
  entities: string[];
}

interface Prediction {
  text: string;
  confidence: number;
}

// 🧩 Thông tin cố định của bạn (mở rộng với thêm chi tiết từ GitHub và profile)
const BOT_KNOWLEDGE = `
Bạn là con Bot của Hồng Lĩnh.
Hồng Lĩnh là sinh viên ngành Kỹ Thuật Phần Mềm, đam mê phát triển web và ứng dụng.
Dự án nổi bật:
- Web Profile cá nhân (React + Vite + TypeScript): https://github.com/lehonglinh12345/profile
- XML_LEHONGLINH2211061 (Python): https://github.com/lehonglinh12345/XML_LEHONGLINH2211061
- DA (HTML/CSS/JS): https://github.com/lehonglinh12345/DA
Kỹ năng: React, Vite, TypeScript, Python, HTML/CSS/JS, Supabase.
Nếu người dùng hỏi về "Facebook", "GitHub", "dự án", "email", "liên hệ", "kỹ năng", "skills", "học vấn", "trường học", "python", "xml", "react", "vite",
hãy trả lời bằng các thông tin thật sau:
- Facebook: https://www.facebook.com/re.hon.rin.2025?mibextid=wwXIfr&rdid=6yl1jmw2ruRP07u1&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1GSWHpf8Zj%2F%3Fmibextid%3DwwXIfr
- GitHub: https://github.com/lehonglinh12345
- Email: lehonglinhcd2004@gmail.com
- Kỹ năng: React, Vite, TypeScript, Python, HTML/CSS/JS, Supabase.
- Học vấn: Sinh viên Kỹ Thuật Phần Mềm.
Khi người dùng chào, hãy chào lại một cách thân thiện bằng tiếng Việt.
Hãy trả lời vui vẻ, hữu ích, và khuyến khích hỏi thêm. Sử dụng ngữ cảnh từ lịch sử để trả lời liên tục.
Nếu người dùng tải lên file (text, code, PDF) hoặc ảnh, hãy đọc/mô tả nội dung file/ảnh và sử dụng nó để trả lời thông minh hơn, ví dụ: phân tích code, tóm tắt tài liệu, mô tả ảnh, hoặc trả lời dựa trên dữ liệu trong file/ảnh.
`;

const LinkIcon = () => <ExternalLink className="h-3 w-3 inline ml-1 opacity-70" />;

// Component để render content với auto-link URLs và emoji support (cập nhật: hỗ trợ render ảnh preview)
const MessageContent = ({ content, isUser, file }: { content: string; isUser: boolean; file?: Message['file'] }) => {
  const urlRegex = /(\bhttps?:\/\/[^\s<>"']+)/g;
  const parts = useMemo(() => content.split(urlRegex), [content]);

  return (
    <div>
      <span className="whitespace-pre-wrap leading-relaxed">
        {parts.map((part, i) => {
          if (part.match(urlRegex)) {
            return (
              <a
                key={i}
                href={part}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "inline-flex items-center gap-1 transition-colors break-all",
                  isUser
                    ? "text-blue-200 hover:text-white underline underline-offset-2"
                    : "text-blue-600 hover:text-blue-800 underline underline-offset-2"
                )}
              >
                {part.length > 50 ? `${part.substring(0, 50)}...` : part}
                <LinkIcon />
              </a>
            );
          }
          return <span key={i}>{part}</span>;
        })}
      </span>
      {file && (
        <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center gap-2">
          {file.type?.startsWith('image/') ? (
            <ImageIcon className="h-4 w-4 text-gray-500" />
          ) : (
            <FileText className="h-4 w-4 text-gray-500" />
          )}
          <span className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-[200px]">{file.name}</span>
          {file.url && (
            <>
              {file.type?.startsWith('image/') ? (
                <img 
                  src={file.url} 
                  alt={file.name} 
                  className="ml-auto w-20 h-20 object-cover rounded border"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }} // Ẩn nếu lỗi load
                />
              ) : (
                <a href={file.url} target="_blank" rel="noopener noreferrer" className="ml-auto text-blue-600 hover:underline">
                  📎
                </a>
              )}
            </>
          )}
          {file.content && !file.type?.startsWith('image/') && (
            <details className="ml-auto text-xs text-gray-500 cursor-pointer">
              <summary>Xem nội dung</summary>
              <pre className="mt-1 p-2 bg-gray-200 dark:bg-gray-800 text-xs overflow-auto max-h-32 rounded">
                {file.content.substring(0, 500)}... {/* Giới hạn hiển thị */}
              </pre>
            </details>
          )}
        </div>
      )}
    </div>
  );
};

// Component cho Typing Effect (tốc độ 20ms/char, sau 3s hiện hết đột ngột)
const TypingMessage = ({ fullContent, onComplete }: { fullContent: string; onComplete: () => void }) => {
  const [displayedContent, setDisplayedContent] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [showFull, setShowFull] = useState(false);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    let index = 0;
    const typingInterval = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      if (elapsed >= 3000) { // Sau 3s, hiện hết đột ngột
        setDisplayedContent(fullContent);
        setShowFull(true);
        setIsTyping(false);
        clearInterval(typingInterval);
        onComplete();
        return;
      }

      if (index < fullContent.length) {
        setDisplayedContent(fullContent.substring(0, index + 1));
        index++;
      } else {
        clearInterval(typingInterval);
        setIsTyping(false);
        onComplete();
      }
    }, 20); // Tốc độ nhanh hơn: 20ms/char

    return () => clearInterval(typingInterval);
  }, [fullContent, onComplete]);

  return (
    <div className="flex items-start gap-3 max-w-[80%] rounded-2xl px-4 py-3 shadow-sm border bg-white/90 dark:bg-gray-800/90 text-gray-800 dark:text-gray-200 rounded-bl-sm border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm transition-all duration-200">
      <div className="h-8 w-8 rounded-full bg-blue-600/20 flex-shrink-0 mt-0.5 flex items-center justify-center">
        <Bot className="h-4 w-4 text-blue-600" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm">
          <span className="whitespace-pre-wrap leading-relaxed">{showFull ? fullContent : displayedContent}</span>
          {isTyping && !showFull && (
            <span className="inline-flex items-center gap-1 ml-1">
              <MousePointer className="h-3 w-3 text-blue-600 animate-pulse" />
            </span>
          )}
          {showFull && (
            <span className="inline-flex items-center gap-1 ml-1 text-blue-600">
              ✨
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// Component cho Prediction Suggestion (cải thiện UX với fade-in)
const PredictionSuggestion = ({ suggestion, onAccept }: { suggestion: Prediction; onAccept: () => void }) => (
  <div className="absolute bottom-full left-0 right-0 mb-2 p-2 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-xl shadow-lg flex items-center justify-between z-20 animate-fade-in">
    <span className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-[calc(100%-3rem)] font-medium">{suggestion.text}</span>
    <Button
      size="sm"
      variant="ghost"
      onClick={onAccept}
      className="h-6 w-6 p-0 ml-2 hover:bg-primary/10 transition-colors"
    >
      <Sparkles className="h-3 w-3 text-primary" />
    </Button>
  </div>
);

export const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Xin chào 👋! Mình là con Bot của Hồng Lĩnh, bạn cần giúp gì hôm nay? Hỏi mình về dự án, kỹ năng hay liên hệ nhé! 😊", timestamp: new Date() }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [context, setContext] = useState<ContextState>({ topic: null, lastUserQuery: null, entities: [] });
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [typingResponse, setTypingResponse] = useState<string>(""); // Full response đang typing
  const [showTyping, setShowTyping] = useState(false); // Flag cho typing effect
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // Thêm state cho file selected
  const [isUploading, setIsUploading] = useState(false); // Flag cho upload progress
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const emojiRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null); // Ref cho file input

  // Giới hạn messages để tối ưu memory (giữ 100 messages cuối)
  const limitedMessages = useMemo(() => messages.slice(-100), [messages]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [limitedMessages, scrollToBottom]);

  // Đóng emoji picker khi click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Xử lý chọn emoji
  const onEmojiClick = useCallback((emojiData: any) => {
    setInput(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  }, []);

  // Xử lý chọn file (hỗ trợ text, PDF, và image/*)
  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Kiểm tra loại file (hỗ trợ text, PDF, image)
    if (!file.type.startsWith('text/') && file.type !== 'application/pdf' && !file.type.startsWith('image/')) {
      toast({
        title: "Loại file không hỗ trợ",
        description: "Chỉ hỗ trợ file text (.txt, .js, .ts, .py), PDF, và ảnh (jpg, png, gif). Thử lại nhé!",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    setIsUploading(true);

    let fileContent = '';
    let fileUrl = '';

    try {
      // Upload file lên Supabase Storage (bucket 'chat-files')
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from('chat-files') // Tạo bucket này trong Supabase nếu chưa có
        .upload(fileName, file, { upsert: true });

      if (error) throw error;

      fileUrl = supabase.storage.from('chat-files').getPublicUrl(fileName).data.publicUrl;

      // Đọc nội dung client-side (cho text files)
      if (file.type.startsWith('text/')) {
        const text = await file.text();
        fileContent = text;
      } else if (file.type === 'application/pdf') {
        // Cho PDF, content sẽ được extract server-side trong Supabase function
        fileContent = '[PDF content sẽ được xử lý server-side]';
      } else if (file.type.startsWith('image/')) {
        // Cho ảnh, không đọc content, chỉ gửi URL để AI mô tả (server-side)
        fileContent = `[Hình ảnh: ${file.name} - URL: ${fileUrl}]`;
      }

      toast({
        title: "File tải lên thành công!",
        description: `Đã thêm ${file.name} vào tin nhắn.`,
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Lỗi tải file",
        description: "Không thể tải file lên. Thử lại nhé!",
        variant: "destructive",
      });
      setSelectedFile(null);
      return;
    } finally {
      setIsUploading(false);
      // Clear file input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }

    // Tự động append file info vào input nếu chưa có text
    if (!input.trim()) {
      setInput(`[File: ${file.name}] `);
    }
  }, [input, toast]);

  // 🧠 Dự đoán tin nhắn tiếp theo dựa trên input hiện tại (tối ưu với fallback)
  const predictNextMessage = useCallback(async (currentInput: string) => {
    if (currentInput.length < 3 || isPredicting) return;

    setIsPredicting(true);
    try {
      const { data, error } = await supabase.functions.invoke("predict", {
        body: {
          prompt: `Dựa trên lịch sử chat và input hiện tại "${currentInput}", dự đoán câu hỏi tiếp theo về Lê Hồng Lĩnh.`,
          context,
          history: limitedMessages.slice(-3).map(m => ({ role: m.role, content: m.content }))
        }
      });

      if (error) throw error;

      if (data?.prediction) {
        setPrediction({
          text: data.prediction.text,
          confidence: data.prediction.confidence || 0.8
        });
      } else {
        // Fallback prediction đơn giản dựa trên context
        if (context.topic) {
          setPrediction({
            text: `Hỏi thêm về ${context.topic}?`,
            confidence: 0.5
          });
        } else {
          setPrediction(null);
        }
      }
    } catch (error) {
      console.error("Prediction error:", error);
      // Fallback đơn giản
      if (context.topic) {
        setPrediction({
          text: `Hỏi thêm về ${context.topic}?`,
          confidence: 0.5
        });
      } else {
        setPrediction(null);
      }
    } finally {
      setIsPredicting(false);
    }
  }, [context, limitedMessages, isPredicting]);

  // Debounced prediction (tối ưu bằng useEffect với clearTimeout)
  useEffect(() => {
    if (!input) {
      setPrediction(null);
      return;
    }

    const timeoutId = setTimeout(() => {
      predictNextMessage(input);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [input, predictNextMessage]);

  // Chấp nhận prediction
  const acceptPrediction = useCallback(() => {
    if (prediction) {
      setInput(prediction.text);
      setPrediction(null);
      inputRef.current?.focus();
    }
  }, [prediction]);

  // 🧠 Phân tích và cập nhật ngữ cảnh từ tin nhắn người dùng (memoized)
  const updateContext = useCallback((userMessage: string) => {
    const lowerMsg = userMessage.toLowerCase();
    let newTopic = context.topic;
    const newEntities = [...context.entities];

    // Phát hiện chủ đề chính (tối ưu logic)
    const topicMap = {
      "dự án": "projects",
      "project": "projects",
      "kỹ năng": "skills",
      "skills": "skills",
      "học vấn": "education",
      "trường": "education",
      "university": "education",
      "sinh viên": "education",
      "liên hệ": "contact",
      "email": "contact",
      "contact": "contact",
      "react": "tech_stack",
      "python": "tech_stack",
      "xml": "tech_stack",
      "vite": "tech_stack"
    };

    for (const [key, value] of Object.entries(topicMap)) {
      if (lowerMsg.includes(key)) {
        newTopic = value;
        newEntities.push(key);
        break;
      }
    }

    // Giới hạn entities
    if (newEntities.length > 5) newEntities.shift();

    setContext(prev => ({
      topic: newTopic || prev.topic,
      lastUserQuery: userMessage,
      entities: newEntities
    }));
  }, [context]);

  // 🧠 Trả lời thông minh nâng cao với ngữ cảnh đầy đủ (memoized dependencies)
  const smartReply = useCallback((text: string, history: Message[]): string | null => {
    const msg = text.toLowerCase().trim();
    const recentHistory = history.slice(-5).filter(m => m.role === "user").map(m => m.content.toLowerCase()).join(' ');

    // Cập nhật context trước
    updateContext(text);

    // Logic trả lời (tối ưu bằng early return)
    if ((msg.includes("chào") || msg.includes("hi") || msg.includes("hello") || msg.includes("xin chào")) && !recentHistory.includes("chào")) {
      return "Chào bạn! 😊 Mình là trợ lý của Lê Hồng Lĩnh đây. Hôm nay bạn khỏe không? Có gì thú vị muốn chia sẻ hay hỏi về Hồng Lĩnh không?";
    }

    if (msg.includes("bạn là ai") || msg.includes("who are you") || msg.includes("bot là gì")) {
      return "Mình là bot thông minh của Lê Hồng Lĩnh 💻, sinh viên Kỹ Thuật Phần Mềm siêu năng động! Mình có thể giúp bạn tìm hiểu về dự án, kỹ năng, hoặc liên hệ với anh ấy. Bạn muốn biết gì nào? 🚀";
    }

    if (msg.includes("facebook") || msg.includes("fb")) {
      return "Đây là Facebook của Hồng Lĩnh: 👉 https://www.facebook.com/re.hon.rin.2025?mibextid=wwXIfr&rdid=6yl1jmw2ruRP07u1&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1GSWHpf8Zj%2F%3Fmibextid%3DwwXIfr. Ghé thăm và like nhé! 👍";
    }

    if (msg.includes("github") || msg.includes("repo") || msg.includes("mã nguồn")) {
      return "GitHub của Hồng Lĩnh ở đây: 💻 https://github.com/lehonglinh12345. Có nhiều dự án hay ho như profile cá nhân và XML Python đấy! Bạn thích repo nào?";
    }

    if (msg.includes("dự án") || msg.includes("project") || msg.includes("làm gì")) {
      if (context.topic === "projects" && context.lastUserQuery?.toLowerCase().includes("chi tiết")) {
        return "Dựa trên câu hỏi trước về dự án, mình recommend Web Profile: Xây dựng bằng React + Vite + TS, tích hợp Supabase cho chat như mình. Code sạch, responsive và deploy dễ dàng! Demo live? 🌟";
      }
      return `Hồng Lĩnh có vài dự án đỉnh cao: 

🌐 **Web Profile** (React + Vite + TS): https://github.com/lehonglinh12345/profile

🐍 **XML_LEHONGLINH2211061** (Python): https://github.com/lehonglinh12345/XML_LEHONGLINH2211061

📄 **DA** (HTML/CSS/JS): https://github.com/lehonglinh12345/DA

Muốn biết chi tiết dự án nào? 🔍`;
    }

    if (msg.includes("kỹ năng") || msg.includes("skills") || msg.includes("công nghệ")) {
      if (context.entities.includes("react")) {
        return "Về React, Hồng Lĩnh dùng nó cho frontend hiện đại, kết hợp Vite để build nhanh. Anh ấy đang học hooks nâng cao và state management với Zustand! Bạn dùng React chưa? ⚛️";
      }
      return "Kỹ năng của Hồng Lĩnh: React, Vite, TypeScript, Python, HTML/CSS/JS, Supabase. Anh ấy đang học thêm AI và full-stack dev! Bạn giỏi gì? 💪";
    }

    if (msg.includes("học vấn") || msg.includes("trường") || msg.includes("university") || msg.includes("sinh viên")) {
      return "Hồng Lĩnh là sinh viên ngành Kỹ Thuật Phần Mềm 🎓 tại trường [Tên trường nếu biết]. Đang miệt mài code và học hỏi mỗi ngày. Bạn học trường nào vậy? 📚";
    }

    if (msg.includes("python") || msg.includes("xml")) {
      if (recentHistory.includes("xml") && msg.includes("cách dùng")) {
        return "Về XML Python, repo của Hồng Lĩnh dùng ElementTree để parse và validate XML. Siêu hữu ích cho data processing! Code mẫu: import xml.etree.ElementTree as ET... Bạn đang build gì với Python? 🐍";
      }
      return "Về Python và XML, Hồng Lĩnh có repo **XML_LEHONGLINH2211061**: https://github.com/lehonglinh12345/XML_LEHONGLINH2211061. Dự án xử lý XML bằng Python siêu cool! Bạn đang làm gì với Python? 🐍";
    }

    if (msg.includes("react") || msg.includes("vite")) {
      return "React + Vite là bộ đôi yêu thích của Hồng Lĩnh! Xem **Web Profile**: https://github.com/lehonglinh12345/profile. Nhanh, hiện đại và dễ scale. Bạn đã thử chưa? ⚛️";
    }

    if (msg.includes("email") || msg.includes("liên hệ") || msg.includes("contact")) {
      return "📧 Email: lehonglinhcd2004@gmail.com. Gửi tin nhắn cho Hồng Lĩnh nhé, anh ấy reply nhanh lắm! Hoặc qua Facebook nếu thích chat hơn. 😄";
    }

    if (msg.includes("cảm ơn") || msg.includes("thanks") || msg.includes("tạm biệt") || msg.includes("bye")) {
      if (context.topic) {
        return `Không có chi về ${context.topic}! 😊 Rất vui được trò chuyện. Hẹn gặp lại bạn nhé, quay lại hỏi thêm về ${context.topic} bất cứ lúc nào! 👋`;
      }
      return "Không có chi! 😊 Rất vui được trò chuyện. Hẹn gặp lại bạn nhé, quay lại hỏi thêm bất cứ lúc nào! 👋";
    }

    if (context.entities.length > 0 && (msg.includes("hơn") || msg.includes("thêm"))) {
      const lastEntity = context.entities[context.entities.length - 1];
      if (lastEntity === "project") {
        return "Thêm về dự án: Ngoài profile, có DA dùng pure HTML/CSS/JS cho đồ án trường. Đơn giản nhưng hiệu quả! Bạn quan tâm frontend hay backend hơn? 📊";
      } else if (lastEntity === "skill") {
        return "Thêm kỹ năng: Hồng Lĩnh cũng biết Git, Docker cơ bản và đang học Next.js. Full-stack journey! 🚀";
      }
    }

    if (msg.includes("?") || msg.includes("hỏi")) {
      if (context.topic) {
        return null; // Để Supabase xử lý với ngữ cảnh đầy đủ
      }
      return "Câu hỏi hay đấy! Để mình kể thêm về Hồng Lĩnh nhé. Anh ấy đam mê code và dự án open-source. Bạn hỏi cụ thể hơn đi! 🤔";
    }

    return null;
  }, [context, updateContext]);

  // Function để start typing animation
  const startTyping = useCallback((response: string) => {
    setTypingResponse(response);
    setShowTyping(true);
  }, []);

  // Effect để handle typing complete
  useEffect(() => {
    if (showTyping && typingResponse) {
      // Typing component sẽ handle onComplete
    }
  }, [showTyping, typingResponse]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() && !selectedFile || isLoading) return;

    const userMessage = input.trim();
    const fileInfo = selectedFile ? { 
      name: selectedFile.name, 
      content: '', 
      url: '', 
      type: selectedFile.type 
    } : undefined;
    setInput("");
    setSelectedFile(null);
    setPrediction(null);
    const newUserMsg: Message = { 
      role: "user", 
      content: userMessage || `[File/Ảnh đính kèm: ${fileInfo?.name}]`, 
      file: fileInfo,
      timestamp: new Date() 
    };
    setMessages(prev => [...prev, newUserMsg]);

    // 🧠 Xử lý offline trước với ngữ cảnh đầy đủ (nếu có file/ảnh, append content nếu có)
    let enhancedMessage = userMessage;
    if (fileInfo && fileInfo.content) {
      enhancedMessage += `\n\nNội dung file ${fileInfo.name}:\n${fileInfo.content}`;
    }
    const smartResponse = smartReply(enhancedMessage, messages);
    if (smartResponse) {
      startTyping(smartResponse);
      return;
    }

    setIsLoading(true);

    try {
      // Nếu có file/ảnh, cần extract server-side; ở đây gửi URL để function xử lý
      const fileUrlToSend = fileInfo?.url || '';
      const { data, error } = await supabase.functions.invoke("chat", {
        body: {
          messages: [
            { role: "system", content: BOT_KNOWLEDGE },
            ...limitedMessages.map(m => ({ 
              role: m.role, 
              content: m.content + (m.file?.content ? `\n\nFile: ${m.file.content}` : '') 
            })),
            { 
              role: "user", 
              content: enhancedMessage,
              file_url: fileUrlToSend, // Gửi URL file/ảnh cho function extract/mô tả nếu cần
              file_type: fileInfo?.type
            }
          ],
          context
        }
      });

      if (error) throw error;

      const response = data?.response || "Ồ, câu hỏi thú vị! Mình đang nghĩ xem... Bạn có thể hỏi cụ thể hơn về Hồng Lĩnh không? 🤔";
      startTyping(response);
    } catch (error) {
      console.error("Chat error:", error);
      toast({
        title: "Lỗi kết nối",
        description: "Không thể tải phản hồi từ server. Thử lại nhé!",
        variant: "destructive",
      });
      startTyping("Xin lỗi 😢, kết nối bị lỗi. Nhưng bạn có thể check GitHub của Hồng Lĩnh: https://github.com/lehonglinh12345 để xem dự án hay ho!");
    } finally {
      setIsLoading(false);
    }
  }, [input, selectedFile, isLoading, limitedMessages, smartReply, context, toast, startTyping, messages]);

  // Handle typing complete
  const handleTypingComplete = useCallback(() => {
    setShowTyping(false);
    setMessages(prev => [...prev, { 
      role: "assistant", 
      content: typingResponse, 
      timestamp: new Date() 
    }]);
    setTypingResponse("");
  }, [typingResponse]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    } else if (e.key === "Tab" && prediction) {
      e.preventDefault();
      acceptPrediction();
    }
  }, [sendMessage, prediction, acceptPrediction]);

  const handleClose = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
    setShowEmojiPicker(false);
    setShowTyping(false);
    setSelectedFile(null);
    setContext({ topic: null, lastUserQuery: null, entities: [] });
    setPrediction(null);
  }, []);

  // Đóng khi click outside (tối ưu UX)
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isOpen && e.target instanceof Element && !e.target.closest('.chat-container')) {
        setIsOpen(false);
        setShowEmojiPicker(false);
        setShowTyping(false);
        setSelectedFile(null);
        setContext({ topic: null, lastUserQuery: null, entities: [] });
        setPrediction(null);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <>
      {/* Nút bật chat - cải thiện animation với scale và glow */}
      <Button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 shadow-2xl hover:shadow-[0_0_20px_rgba(139,92,246,0.5)] transition-all duration-300 hover:scale-110 hover:rotate-12",
          isOpen ? "scale-0 opacity-0" : "scale-100 opacity-100 animate-bounce-subtle"
        )}
        size="icon"
      >
        <MessageCircle className="h-6 w-6 drop-shadow-sm" />
      </Button>

      {/* Cửa sổ chat - thêm class cho outside click, tăng height cho emoji */}
      {isOpen && (
        <div className="chat-container fixed bottom-6 right-6 z-50 w-96 h-[650px] flex flex-col shadow-2xl border border-white/20 backdrop-blur-md bg-white/90 dark:bg-gray-900/90 transition-all duration-300 scale-100 opacity-100 rounded-2xl overflow-hidden">
          <Card className="flex-1 flex flex-col overflow-hidden border-0 bg-transparent">
            {/* Header - gradient tinh tế hơn, thêm subtle glow */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-blue-50/90 via-purple-50/90 to-pink-50/90 dark:from-gray-800/90 dark:via-gray-900/90 dark:to-gray-800/90 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse ring-2 ring-green-500/30" />
                <div className="flex items-center gap-1">
                  <Bot className="h-4 w-4 text-blue-600 drop-shadow-sm" />
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 tracking-tight">AI Hỗ Trợ Hồng Lĩnh</h3>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="h-8 w-8 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-all duration-200 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Nội dung chat - cải thiện scroll với custom scrollbar, thêm timestamp subtle */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-transparent via-white/50 to-gray-50/50 dark:via-gray-900/50 dark:to-gray-900/50 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
              {limitedMessages.map((msg, i) => (
                <div
                  key={`${msg.role}-${msg.timestamp?.getTime() || i}`}
                  className={cn(
                    "flex animate-in slide-in-from-bottom-2 duration-300",
                    msg.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div className={cn(
                    "flex items-start gap-3 max-w-[80%] rounded-2xl px-4 py-3 shadow-sm border",
                    msg.role === "user"
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-br-sm border-transparent"
                      : "bg-white/90 dark:bg-gray-800/90 text-gray-800 dark:text-gray-200 rounded-bl-sm border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm"
                  )}>
                    <div className={cn(
                      "h-8 w-8 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center",
                      msg.role === "user"
                        ? "bg-white/20"
                        : "bg-blue-600/20"
                    )}>
                      {msg.role === "user" ? (
                        <User className="h-4 w-4 text-white/80" />
                      ) : (
                        <Bot className="h-4 w-4 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm">
                        <MessageContent content={msg.content} isUser={msg.role === "user"} file={msg.file} />
                      </div>
                      <div className="mt-1 text-xs text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        {msg.timestamp?.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {showTyping && typingResponse && (
                <div className="flex justify-start animate-in slide-in-from-bottom-2 duration-300">
                  <TypingMessage fullContent={typingResponse} onComplete={handleTypingComplete} />
                </div>
              )}
              {isLoading && !showTyping && (
                <div className="flex justify-start animate-in slide-in-from-bottom-2 duration-300">
                  <div className="bg-white/90 dark:bg-gray-800/90 rounded-2xl px-4 py-3 border border-gray-200/50 dark:border-gray-700/50 shadow-sm flex items-center gap-2 backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                      <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Đang suy nghĩ với ngữ cảnh... 💭</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Emoji Picker - di chuyển ra ngoài Card để tránh overflow */}
            {showEmojiPicker && (
              <div ref={emojiRef} className="absolute bottom-[100px] right-0 z-30 w-80 shadow-2xl rounded-xl overflow-hidden border border-gray-200/50 dark:border-gray-700/50">
                <Picker onEmojiClick={onEmojiClick} height={350} className="border-none" />
              </div>
            )}

            {/* Ô nhập với Prediction - thêm nút upload file/ảnh */}
            <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm relative">
              <div className="relative">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder={context.topic ? `Tiếp tục về ${context.topic}... (hoặc đính kèm file/ảnh)` : "Hỏi mình về Hồng Lĩnh đi... (VD: Dự án React? Hoặc upload file/ảnh để phân tích)"}
                  disabled={isLoading || showTyping || isUploading}
                  className="flex-1 bg-white/80 dark:bg-gray-700/80 border-gray-300/50 dark:border-gray-600/50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all duration-200 placeholder-gray-500 pr-28 rounded-xl shadow-inner" // pr-28 để chỗ cho upload button
                />
                {prediction && (
                  <PredictionSuggestion suggestion={prediction} onAccept={acceptPrediction} />
                )}
                {/* Nút Upload File/Ảnh */}
                <Button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading || showTyping || isUploading}
                  size="icon"
                  variant="ghost"
                  className="h-10 w-10 absolute right-28 top-1/2 -translate-y-1/2 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-all duration-200 rounded-full z-10"
                >
                  {isUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-5 w-5" />
                  )}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.js,.ts,.py,application/pdf,image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  type="button"
                  onClick={() => setShowEmojiPicker(prev => !prev)}
                  disabled={isLoading || showTyping || isUploading}
                  size="icon"
                  variant="ghost"
                  className="h-10 w-10 absolute right-20 top-1/2 -translate-y-1/2 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-all duration-200 rounded-full z-10"
                >
                  <Smile className="h-5 w-5" />
                </Button>
                <Button
                  onClick={sendMessage}
                  disabled={isLoading || showTyping || isUploading || (!input.trim() && !selectedFile)}
                  size="icon"
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 shadow-lg hover:shadow-purple-500/25 transition-all duration-200 absolute right-2 top-1/2 -translate-y-1/2 rounded-full z-10 h-10 w-10"
                >
                  {isLoading || showTyping ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
                {isPredicting && (
                  <div className="absolute right-12 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-white/50 dark:bg-gray-800/50 px-2 py-1 rounded-full">
                    <Loader2 className="h-3 w-3 animate-spin text-gray-500" />
                    <span className="text-xs text-gray-500">Đang dự đoán...</span>
                  </div>
                )}
                {selectedFile && !isUploading && (
                  <div className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-green-100 dark:bg-green-900/50 px-2 py-1 rounded-full text-xs">
                    {selectedFile.type.startsWith('image/') ? <ImageIcon className="h-3 w-3" /> : <FileText className="h-3 w-3" />}
                    {selectedFile.name.substring(0, 20)}...
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  );
};