import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea"; // Thay đổi từ Input sang Textarea để hỗ trợ multiline
import { MessageCircle, X, Send, Loader2, User, Bot, ExternalLink, Smile, MousePointer, Upload, FileText, Image as ImageIcon, Mic, MicOff, ThumbsUp, ThumbsDown, Copy, Palette } from "lucide-react";
import Picker from "emoji-picker-react"; // npm install emoji-picker-react
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils"; // Giả sử bạn có cn utility từ shadcn


declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  grammars: SpeechGrammarList;
  abort(): void;
  start(): void;
  stop(): void;
  addEventListener<K extends keyof SpeechRecognitionEventMap>(
    type: K,
    listener: (this: SpeechRecognition, ev: SpeechRecognitionEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof SpeechRecognitionEventMap>(
    type: K,
    listener: (this: SpeechRecognition, ev: SpeechRecognitionEventMap[K]) => any,
    options?: EventListenerOptions | boolean
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: EventListenerOptions | boolean
  ): void;
}

interface SpeechRecognitionEventMap extends EventTarget {
  result: SpeechRecognitionEvent;
  nomatch: SpeechRecognitionEvent;
  error: SpeechRecognitionErrorEvent;
  start: Event;
  soundstart: Event;
  speechstart: Event;
  speechend: Event;
  soundend: Event;
  end: Event;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

interface SpeechGrammarList {
  readonly length: number;
  addFromUri(src: string, weight?: number): void;
  addFromString(string: string, weight?: number): void;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface Message {
  id: string;
  role: "user" | "AI Bot";
  content: string;
  file?: { 
    name: string; 
    content?: string; 
    url?: string; 
    type?: string; // Thêm type để phân biệt image/file
  }; // Thêm file attachment với type
  timestamp?: Date;
  liked?: boolean;
  disliked?: boolean;
}

interface ContextState {
  topic: string | null;
  lastUserQuery: string | null;
  entities: string[];
  userLang: 'vi' | 'en'; // Thêm userLang vào context
}

// 🧩 Thông tin cố định của bạn (bilingual: hỗ trợ tiếng Việt và tiếng Anh, AI sẽ tự detect ngôn ngữ khác)
const BOT_KNOWLEDGE = `
You are the Bot of Hồng Lĩnh (Le Hong Linh), a Software Engineering student passionate about web and app development.

Key info (detect user's language and respond accordingly: Vietnamese for VN keywords like 'chào', 'dự án'; English otherwise; for other languages, respond in that language if possible):
Dự án nổi bật / Key Projects:
-djanog : 
- Web Profile cá nhân (React + Vite + TypeScript): https://github.com/lehonglinh12345/profile-
- XML_LEHONGLINH2211061 (Python): https://github.com/lehonglinh12345/XML_LEHONGLINH2211061
- DA (HTML/CSS/JS): https://github.com/lehonglinh12345/DA

Kỹ năng / Skills: React, Vite, TypeScript, Python, HTML/CSS/JS, Django.

Nếu người dùng hỏi về "Facebook", "GitHub", "dự án", "project", "email", "liên hệ", "contact", "kỹ năng", "skills", "học vấn", "education", "trường học", "university", "python", "xml", "react", "vite",
hãy trả lời bằng các thông tin thật sau / If asked about these, reply with accurate info in user's language:
- Facebook: https://www.facebook.com/re.hon.rin.2025?mibextid=wwXIfr&rdid=6yl1jmw2ruRP07u1&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1GSWHpf8Zj%2F%3Fmibextid%3DwwXIfr
- GitHub: https://github.com/lehonglinh12345
- Email: lehonglinhcd2004@gmail.com
- Kỹ năng / Skills: React, Vite, TypeScript, Python, HTML/CSS/JS, Django.
- Học vấn / Education: Sinh viên Kỹ Thuật Phần Mềm / Software Engineering student.
- Trường học / University: Trường Đại học Kỹ thuật - Công nghệ Cần Thơ (CTUET) / Can Tho University of Technology (CTUT).


Khi người dùng chào, hãy chào lại một cách thân thiện bằng ngôn ngữ của họ / Greet friendly in user's language.
Hãy trả lời vui vẻ, hữu ích, và khuyến khích hỏi thêm. Sử dụng ngữ cảnh từ lịch sử để trả lời liên tục / Be fun, helpful, encourage more questions. Use history for continuity.
Nếu người dùng tải lên file (text, code, PDF) hoặc ảnh, hãy đọc/mô tả nội dung file/ảnh và sử dụng nó để trả lời thông minh hơn / For files/images: Analyze/describe and respond smartly, e.g., code analysis, doc summary, image description.

DETECT LANGUAGE AUTOMATICALLY: Respond in the detected language of the user's input. Support multiple languages as much as possible.
`;

const LinkIcon = () => <ExternalLink className="h-3 w-3 inline ml-1 opacity-70" />;

// Component để render content với auto-link URLs và emoji support (cập nhật: hỗ trợ render ảnh preview)
const MessageContent = ({ content, isUser, file }: { content: string; isUser: boolean; file?: Message['file'] }) => {
  const urlRegex = /(\bhttps?:\/\/[^\s<>"']+)/g;
  const parts = useMemo(() => content.split(urlRegex), [content]);

  return (
    <div>
      <span className="whitespace-pre-wrap leading-relaxed" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
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
                style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}
              >
                {part.length > 50 ? `${part.substring(0, 50)}...` : part}
                <LinkIcon />
              </a>
            );
          }
          return <span key={i} style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>{part}</span>;
        })}
      </span>
      {file && (
        <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center gap-2">
          {file.type?.startsWith('image/') ? (
            <ImageIcon className="h-4 w-4 text-gray-500" />
          ) : (
            <FileText className="h-4 w-4 text-gray-500" />
          )}
          <span className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-[200px]" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>{file.name}</span>
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
                <a href={file.url} target="_blank" rel="noopener noreferrer" className="ml-auto text-blue-600 hover:underline" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
                  📎
                </a>
              )}
            </>
          )}
          {file.content && !file.type?.startsWith('image/') && (
            <details className="ml-auto text-xs text-gray-500 cursor-pointer">
              <summary style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>Xem nội dung</summary>
              <pre className="mt-1 p-2 bg-gray-200 dark:bg-gray-800 text-xs overflow-auto max-h-32 rounded" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
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
const TypingMessage = ({ fullContent, onComplete, chatColor }: { fullContent: string; onComplete: () => void; chatColor: string }) => {
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
        <Bot className="h-4 w-4" style={{ color: chatColor }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm">
          <span className="whitespace-pre-wrap leading-relaxed" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>{showFull ? fullContent : displayedContent}</span>
          {isTyping && !showFull && (
            <span className="inline-flex items-center gap-1 ml-1">
              <MousePointer className="h-3 w-3" style={{ color: chatColor }} />
            </span>
          )}
          {showFull && (
            <span className="inline-flex items-center gap-1 ml-1" style={{ color: chatColor }}>
              ✨
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// Voice Indicator Component (thanh nói) - dynamic based on lang
const VoiceIndicator = ({ lang, chatColor }: { lang: 'vi' | 'en'; chatColor: string }) => {
  return (
    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-4 py-2 bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-800 rounded-lg flex items-center gap-2 shadow-lg z-10">
      {/* Animated bars */}
      <div className="flex gap-0.5">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="w-1 rounded animate-pulse"
            style={{
              height: `${20 + Math.random() * 20}px`,
              backgroundColor: chatColor,
              animationDelay: `${i * 0.1}s`,
              animationDuration: `${0.5 + Math.random() * 0.5}s`
            }}
          />
        ))}
      </div>
      <span className="text-sm font-medium">
        {lang === 'vi' ? 'Đang lắng nghe... Nói rõ ràng và chậm rãi nhé!' : 'Listening... Speak clearly and slowly!'}
      </span>
      <Mic className="h-4 w-4 ml-auto animate-pulse" style={{ color: chatColor }} />
    </div>
  );
};

export const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: 'initial', 
      role: "AI Bot", 
      content: "Xin chào 👋! Mình là con Bot của Hồng Lĩnh, bạn cần giúp gì hôm nay? Hỏi mình về dự án, kỹ năng hay liên hệ nhé! 😊", 
      timestamp: new Date(),
      liked: false,
      disliked: false
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [context, setContext] = useState<ContextState>({ topic: null, lastUserQuery: null, entities: [], userLang: 'vi' }); // Default 'vi'
  const [typingResponse, setTypingResponse] = useState<string>(""); // Full response đang typing
  const [showTyping, setShowTyping] = useState(false); // Flag cho typing effect
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // Thêm state cho file selected
  const [isUploading, setIsUploading] = useState(false); // Flag cho upload progress
  // Tích hợp nhận diện giọng nói (default vi-VN, AI sẽ handle multi-lang text)
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState(""); // Thêm state cho interim preview (không append vào input)
  const [copiedIds, setCopiedIds] = useState(new Set<string>()); // State cho animation copy button
  const [chatColor, setChatColor] = useState('#3b82f6'); // Màu chính mặc định (blue-500)
  const [showColorPicker, setShowColorPicker] = useState(false); // Toggle cho color picker
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const emojiRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null); // Cập nhật ref cho Textarea
  const fileInputRef = useRef<HTMLInputElement>(null); // Ref cho file input

  // Function to update a specific message
  const updateMessage = useCallback((id: string, updates: Partial<Omit<Message, 'id'>>) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  }, []);

  // Copy to clipboard function with animation trigger
  const copyToClipboard = useCallback(async (text: string, onSuccess?: () => void, onError?: () => void) => {
    try {
      await navigator.clipboard.writeText(text);
      // toast({
      //   title: "Đã sao chép!",
      //   description: "Nội dung đã được sao chép vào clipboard.",
      // });
      onSuccess?.();
    } catch (err) {
      console.error('Failed to copy: ', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        // toast({
        //   title: "Đã sao chép!",
        //   description: "Nội dung đã được sao chép vào clipboard.",
        // });
        onSuccess?.();
      } catch (fallbackErr) {
        toast({
          title: "Lỗi sao chép",
          description: "Không thể sao chép nội dung. Vui lòng copy thủ công.",
          variant: "destructive",
        });
        onError?.();
      }
      document.body.removeChild(textArea);
    }
  }, [toast]);

  // Handle copy with animation
  const handleCopy = useCallback(async (id: string, content: string) => {
    setCopiedIds(prev => new Set([...prev, id]));
    const success = () => {
      // Animation on success (spin green)
      setTimeout(() => {
        setCopiedIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      }, 800);
    };
    const error = () => {
      // No spin on error, or brief red flash if wanted
      setCopiedIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    };
    await copyToClipboard(content, success, error);
  }, [copyToClipboard]);

  // Simple language detection (based on keywords for vi/en, AI handles others)
  const detectLanguage = useCallback((text: string): 'vi' | 'en' => {
    const viKeywords = ['chào', 'dự án', 'kỹ năng', 'học vấn', 'liên hệ', 'python', 'xml', 'react', 'vite', 'sinh viên', 'trường'];
    const lowerText = text.toLowerCase();
    return viKeywords.some(kw => lowerText.includes(kw)) ? 'vi' : 'en';
  }, []);

  // Khởi tạo SpeechRecognition (default vi-VN, but text responses multi-lang)
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'vi-VN'; // Default VN, but AI detects input lang for response
      recognition.continuous = false; // Đảm bảo không continuous để tránh lặp
      recognition.interimResults = true; // Giữ để preview interim
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setInterimTranscript(""); // Reset interim
        // Bỏ toast, sử dụng VoiceIndicator thay thế
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = ''; // Chỉ append final results
        let interimTranscriptTemp = ''; // Interim chỉ để preview

        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscriptTemp += event.results[i][0].transcript;
          }
        }

        // Chỉ append final transcript vào input để tránh lặp
        if (finalTranscript) {
          setInput(prev => prev + finalTranscript);
        }

        // Cập nhật interim cho preview (có thể hiển thị tạm thời trong input nếu muốn, nhưng không append vĩnh viễn)
        setInterimTranscript(interimTranscriptTemp);

        // Tự động focus vào textarea để tiếp tục edit
        inputRef.current?.focus();
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setInterimTranscript("");
        toast({
          title: "Lỗi nhận diện giọng nói",
          description: `Lỗi: ${event.error}. Thử lại nhé! (Kiểm tra quyền microphone)`,
          variant: "destructive",
        });
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimTranscript("");
      };

      recognitionRef.current = recognition;
    } else {
      toast({
        title: "Không hỗ trợ nhận diện giọng nói",
        description: "Trình duyệt của bạn không hỗ trợ Web Speech API. Sử dụng Chrome hoặc Edge nhé!",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Toggle listening
  const toggleListening = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition) {
      toast({
        title: "Không hỗ trợ",
        description: "Nhận diện giọng nói không khả dụng.",
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
  }, [isListening, toast]);

  // Cleanup khi unmount hoặc close
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

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
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Lỗi tải file",
        description: error.message || "Không thể tải file lên. Thử lại nhé! (Kiểm tra bucket 'chat-files' trong Supabase có tồn tại và public không)",
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

  // 🧠 Phân tích và cập nhật ngữ cảnh từ tin nhắn người dùng (memoized, with lang detect)
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

    const detectedLang = detectLanguage(userMessage);

    setContext(prev => ({
      topic: newTopic || prev.topic,
      lastUserQuery: userMessage,
      entities: newEntities,
      userLang: detectedLang || prev.userLang
    }));
  }, [context, detectLanguage]);

  // 🧠 Trả lời thông minh nâng cao với ngữ cảnh đầy đủ (multi-lang via AI, fallback bilingual)
  const smartReply = useCallback((text: string, history: Message[]): string | null => {
    const msg = text.toLowerCase().trim();
    const recentHistory = history.slice(-5).filter(m => m.role === "user").map(m => m.content.toLowerCase()).join(' ');
    const userLang = detectLanguage(text);

    // Cập nhật context trước
    updateContext(text);

    // Logic trả lời (bilingual fallback, AI handles more via prompt)
    if ((msg.includes("chào") || msg.includes("hi") || msg.includes("hello") || msg.includes("xin chào")) && !recentHistory.includes("chào")) {
      return userLang === 'vi'
        ? "Chào bạn! 😊 Mình là con Bot của Lê Hồng Lĩnh đây. Hôm nay bạn khỏe không? Có gì thú vị muốn chia sẻ hay hỏi về Hồng Lĩnh không?"
        : "Hello! 😊 I'm Le Hong Linh's bot. How are you today? Anything fun to share or ask about Linh?";
    }

    if (msg.includes("bạn là ai") || msg.includes("who are you") || msg.includes("bot là gì")) {
      return userLang === 'vi'
        ? "I'm Le Hong Linh's smart bot 💻, a super energetic Software Engineering student! I can help you learn about projects, skills, or contact him. What would you like to know? 🚀"
        : "Mình là con bot của Lê Hồng Lĩnh 💻, sinh viên Kỹ Thuật Phần Mềm siêu năng động! Mình có thể giúp bạn tìm hiểu về dự án, kỹ năng, hoặc liên hệ với anh ấy. Bạn muốn biết gì nào? 🚀";
    }

    if (msg.includes("facebook") || msg.includes("fb")) {
      return userLang === 'vi'
        ? "Đây là Facebook của Hồng Lĩnh: 👉 https://www.facebook.com/re.hon.rin.2025?mibextid=wwXIfr&rdid=6yl1jmw2ruRP07u1&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1GSWHpf8Zj%2F%3Fmibextid%3DwwXIfr. Ghé thăm và like nhé! 👍"
        : "Here's Hong Linh's Facebook: 👉 https://www.facebook.com/re.hon.rin.2025?mibextid=wwXIfr&rdid=6yl1jmw2ruRP07u1&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1GSWHpf8Zj%2F%3Fmibextid%3DwwXIfr. Visit and like it! 👍";
    }

    if (msg.includes("github") || msg.includes("repo") || msg.includes("mã nguồn")) {
      return userLang === 'vi'
        ? "GitHub của Hồng Lĩnh ở đây: 💻 https://github.com/lehonglinh12345. Có nhiều dự án hay ho như profile cá nhân và XML Python đấy! Bạn thích repo nào?"
        : "Hong Linh's GitHub is here: 💻 https://github.com/lehonglinh12345. Lots of cool projects like personal profile and Python XML! Which repo do you like?";
    }

    if (msg.includes("dự án") || msg.includes("project") || msg.includes("làm gì")) {
      if (context.topic === "projects" && context.lastUserQuery?.toLowerCase().includes("chi tiết")) {
        return userLang === 'vi'
          ? "Dựa trên câu hỏi trước về dự án, mình recommend Web Profile: Xây dựng bằng React + Vite + TS, tích hợp AI cho chat như mình. Code sạch, responsive và deploy dễ dàng! Demo live? 🌟"
          : "Based on your previous question about projects, I recommend Web Profile: Built with React + Vite + TS, Django for chat like me. Clean code, responsive, and easy to deploy! Live demo? 🌟";
      }
      return userLang === 'vi'
        ? `Hồng Lĩnh có vài dự án đỉnh cao: 

🌐 **Web Profile** (React + Vite + TS): https://github.com/lehonglinh12345/profile-

🐍 **XML_LEHONGLINH2211061** (Python): https://github.com/lehonglinh12345/XML_LEHONGLINH2211061

📄 **DA** (HTML/CSS/JS): https://github.com/lehonglinh12345/DA

Muốn biết chi tiết dự án nào? 🔍`
        : `Hong Linh has some top-notch projects: 

🌐 **Web Profile** (React + Vite + TS): https://github.com/lehonglinh12345/profile-

🐍 **XML_LEHONGLINH2211061** (Python): https://github.com/lehonglinh12345/XML_LEHONGLINH2211061

📄 **DA** (HTML/CSS/JS): https://github.com/lehonglinh12345/DA

Want details on which project? 🔍`;
    }

    if (msg.includes("kỹ năng") || msg.includes("skills") || msg.includes("công nghệ")) {
      if (context.entities.includes("react")) {
        return userLang === 'vi'
          ? "Về React, Hồng Lĩnh dùng nó cho frontend hiện đại, kết hợp Vite để build nhanh. Anh ấy đang học hooks nâng cao và state management với Zustand! Bạn dùng React chưa? ⚛️"
          : "About React, Hong Linh uses it for modern frontend, combined with Vite for fast builds. He's learning advanced hooks and state management with Zustand! Have you used React? ⚛️";
      }
      return userLang === 'vi'
        ? "Kỹ năng của Hồng Lĩnh: React, Vite, TypeScript, Python, HTML/CSS/JS, Supabase. Anh ấy đang học thêm AI và Tiếng Nhật! Bạn giỏi gì? 💪"
        : "Hong Linh's skills: React, Vite, TypeScript, Python, HTML/CSS/JS, Supabase. He's learning AI and Japan! What are you good at? 💪";
    }

    if (msg.includes("học vấn") || msg.includes("trường") || msg.includes("university") || msg.includes("sinh viên")) {
      return userLang === 'vi'
        ? "Hồng Lĩnh là sinh viên ngành Kỹ Thuật Phần Mềm 🎓 tại Trường Đại học Kỹ thuật - Công nghệ Cần Thơ (CTUET). Đang miệt mài code và học hỏi mỗi ngày. Bạn học trường nào vậy? 📚"
        : "Hong Linh is a Software Engineering student 🎓 at Can Tho University of Technology (CTUT). Diligently coding and learning every day. Which school do you go to? 📚";
    }

    if (msg.includes("python") || msg.includes("xml")) {
      if (recentHistory.includes("xml") && msg.includes("cách dùng")) {
        return userLang === 'vi'
          ? "Về XML Python, repo của Hồng Lĩnh dùng ElementTree để parse và validate XML. Siêu hữu ích cho data processing! Code mẫu: import xml.etree.ElementTree as ET... Bạn đang build gì với Python? 🐍"
          : "About Python XML, Hong Linh's repo uses ElementTree to parse and validate XML. Super useful for data processing! Sample code: import xml.etree.ElementTree as ET... What are you building with Python? 🐍";
      }
      return userLang === 'vi'
        ? "Về Python và XML, Hồng Lĩnh có repo **XML_LEHONGLINH2211061**: https://github.com/lehonglinh12345/XML_LEHONGLINH2211061. Dự án xử lý XML bằng Python siêu cool! Bạn đang làm gì với Python? 🐍"
        : "About Python and XML, Hong Linh has repo **XML_LEHONGLINH2211061**: https://github.com/lehonglinh12345/XML_LEHONGLINH2211061. Cool project handling XML with Python! What are you doing with Python? 🐍";
    }

    if (msg.includes("react") || msg.includes("vite")) {
      return userLang === 'vi'
        ? "React + Vite là bộ đôi yêu thích của Hồng Lĩnh! Xem **Web Profile**: https://github.com/lehonglinh12345/profile-. Nhanh, hiện đại và dễ scale. Bạn đã thử chưa? ⚛️"
        : "React + Vite is Hong Linh's favorite duo! Check **Web Profile**: https://github.com/lehonglinh12345/profile-. Fast, modern, and easy to scale. Have you tried it? ⚛️";
    }

    if (msg.includes("email") || msg.includes("liên hệ") || msg.includes("contact")) {
      return userLang === 'vi'
        ? "📧 Email: lehonglinhcd2004@gmail.com. Gửi tin nhắn cho Hồng Lĩnh nhé, anh ấy reply nhanh lắm! Hoặc qua Facebook nếu thích chat hơn. 😄"
        : "📧 Email: lehonglinhcd2004@gmail.com. Send a message to Hong Linh—he replies fast! Or chat via Facebook if you prefer. 😄";
    }

    if (msg.includes("cảm ơn") || msg.includes("thanks") || msg.includes("tạm biệt") || msg.includes("bye")) {
      if (context.topic) {
        return userLang === 'vi'
          ? `Không có chi về ${context.topic}! 😊 Rất vui được trò chuyện. Hẹn gặp lại bạn nhé, quay lại hỏi thêm về ${context.topic} bất cứ lúc nào! 👋`
          : `No problem about ${context.topic}! 😊 Great chatting. See you soon—come back anytime for more on ${context.topic}! 👋`;
      }
      return userLang === 'vi'
        ? "Không có chi! 😊 Rất vui được trò chuyện. Hẹn gặp lại bạn nhé, quay lại hỏi thêm bất cứ lúc nào! 👋"
        : "No problem! 😊 Great chatting. See you soon—come back anytime! 👋";
    }

    if (context.entities.length > 0 && (msg.includes("hơn") || msg.includes("thêm"))) {
      const lastEntity = context.entities[context.entities.length - 1];
      if (lastEntity === "project") {
        return userLang === 'vi'
          ? "Thêm về dự án: Ngoài profile, có DA dùng pure HTML/CSS/JS cho đồ án trường. Đơn giản nhưng hiệu quả! Bạn quan tâm frontend hay backend hơn? 📊"
          : "More on projects: Besides profile, there's DA using pure HTML/CSS/JS for school assignment. Simple but effective! Frontend or backend interest? 📊";
      } else if (lastEntity === "skill") {
        return userLang === 'vi'
          ? "Thêm kỹ năng: Hồng Lĩnh cũng biết Git, Django cơ bản và đang học reactjs & Nodejs ."
          : "More skills: Hong Linh also knows basic Git, django, and is learning reactjs & Nodejs.";
      }
    }

    if (msg.includes("?") || msg.includes("hỏi")) {
      if (context.topic) {
        return null; // Để Supabase xử lý với ngữ cảnh đầy đủ
      }
      return userLang === 'vi'
        ? "Câu hỏi hay đấy! Để mình kể thêm về Hồng Lĩnh nhé. Anh ấy đam mê code và dự án open-source. Bạn hỏi cụ thể hơn đi! 🤔"
        : "Great question! Let me tell you more about Hong Linh. He's passionate about coding and open-source projects. Ask more specifically! 🤔";
    }

    return null;
  }, [context, updateContext, detectLanguage]);

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
    const messageId = `user-${Date.now()}`;
    const newUserMsg: Message = { 
      id: messageId,
      role: "user", 
      content: userMessage || `[File/Ảnh đính kèm: ${fileInfo?.name}]`, 
      file: fileInfo,
      timestamp: new Date(),
      liked: false,
      disliked: false
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
      const detectedLang = detectLanguage(enhancedMessage);
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
          context: { ...context, userLang: detectedLang },
          user_lang: detectedLang // Pass lang cho server-side để AI respond accordingly
        }
      });

      if (error) throw error;

      const response = data?.response || (detectedLang === 'vi' 
        ? "Ồ, câu hỏi thú vị! Mình đang nghĩ xem... Bạn có thể hỏi cụ thể hơn về Hồng Lĩnh không? 🤔"
        : "Oh, interesting question! Let me think... Can you ask more specifically about Hong Linh? 🤔");
      startTyping(response);
    } catch (error) {
      console.error("Chat error:", error);
      const fallbackLang = detectLanguage(enhancedMessage);
      const fallbackMsg = fallbackLang === 'vi'
        ? "Xin lỗi 😢, kết nối bị lỗi. Nhưng bạn có thể check GitHub của Hồng Lĩnh: https://github.com/lehonglinh12345 để xem dự án hay ho!"
        : "Sorry 😢, connection error. But you can check Hong Linh's GitHub: https://github.com/lehonglinh12345 for cool projects!";
      toast({
        title: "Lỗi kết nối",
        description: "Không thể tải phản hồi từ server. Thử lại nhé!",
        variant: "destructive",
      });
      startTyping(fallbackMsg);
    } finally {
      setIsLoading(false);
    }
  }, [input, selectedFile, isLoading, limitedMessages, smartReply, context, toast, startTyping, messages, detectLanguage]);

  // Handle typing complete
  const handleTypingComplete = useCallback(() => {
    setShowTyping(false);
    const aiId = `ai-${Date.now()}`;
    setMessages(prev => [...prev, { 
      id: aiId,
      role: "AI Bot", 
      content: typingResponse, 
      timestamp: new Date(),
      liked: false,
      disliked: false
    }]);
    setTypingResponse("");
  }, [typingResponse]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => { // Cập nhật type cho Textarea
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  const handleClose = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
    setShowEmojiPicker(false);
    setShowTyping(false);
    setSelectedFile(null);
    setContext({ topic: null, lastUserQuery: null, entities: [], userLang: 'vi' });
    // Dừng listening khi đóng
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  // Đóng khi click outside (tối ưu UX)
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isOpen && e.target instanceof Element && !e.target.closest('.chat-container')) {
        setIsOpen(false);
        setShowEmojiPicker(false);
        setShowTyping(false);
        setSelectedFile(null);
        setContext({ topic: null, lastUserQuery: null, entities: [], userLang: 'vi' });
        // Dừng listening
        if (recognitionRef.current) {
          recognitionRef.current.stop();
        }
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Hiển thị interim transcript tạm thời trong input (nếu muốn preview, nhưng không lưu)
  const displayedInput = useMemo(() => input + interimTranscript, [input, interimTranscript]);

  // Get lang-specific text for UI
  const getLangText = useCallback((viText: string, enText: string) => {
    return context.userLang === 'vi' ? viText : enText;
  }, [context.userLang]);

  return (
    <>
      {/* Nút bật chat - cải thiện animation với scale và glow */}
      <Button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-2xl hover:shadow-[0_0_20px_rgba(139,92,246,0.5)] transition-all duration-300 hover:scale-110 hover:rotate-12",
          isOpen ? "scale-0 opacity-0" : "scale-100 opacity-100 animate-bounce-subtle"
        )}
        size="icon"
        style={{
          background: `linear-gradient(to bottom right, ${chatColor}, #a855f7, #ec4899)`
        }}
      >
        <MessageCircle className="h-6 w-6 drop-shadow-sm" />
      </Button>

      {/* Cửa sổ chat - thêm class cho outside click, tăng height cho emoji */}
      {isOpen && (
        <div 
          className="chat-container fixed bottom-6 right-6 z-50 w-96 h-[650px] flex flex-col shadow-2xl border border-white/20 backdrop-blur-md bg-white/90 dark:bg-gray-900/90 transition-all duration-300 scale-100 opacity-100 rounded-2xl overflow-hidden"
          style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}
        >
          <Card className="flex-1 flex flex-col overflow-hidden border-0 bg-transparent">
            {/* Header - gradient tinh tế hơn, thêm subtle glow */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-blue-50/90 via-purple-50/90 to-pink-50/90 dark:from-gray-800/90 dark:via-gray-900/90 dark:to-gray-800/90 backdrop-blur-sm relative">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse ring-2 ring-green-500/30" />
                <div className="flex items-center gap-1">
                  <Bot className="h-4 w-4" style={{ color: chatColor }} />
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 tracking-tight" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>AI Hỗ Trợ Hồng Lĩnh</h3>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Color Picker Button */}
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    className="h-8 w-8 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-all duration-200 rounded-full"
                  >
                    <Palette className="h-4 w-4" />
                  </Button>
                  {showColorPicker && (
                    <div className="absolute top-full right-0 mt-2 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200/50 dark:border-gray-700/50 z-10">
                      <input
                        type="color"
                        value={chatColor}
                        onChange={(e) => setChatColor(e.target.value)}
                        className="w-10 h-10 rounded cursor-pointer border-0"
                      />
                    </div>
                  )}
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
            </div>

            {/* Nội dung chat - cải thiện scroll với custom scrollbar, thêm timestamp subtle */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-transparent via-white/50 to-gray-50/50 dark:via-gray-900/50 dark:to-gray-900/50 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
              {limitedMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex animate-in slide-in-from-bottom-2 duration-300 group",
                    msg.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div className={cn(
                    "flex flex-col items-start gap-3 max-w-[80%] rounded-2xl px-4 py-3 shadow-sm border",
                    msg.role === "user"
                      ? "text-white rounded-br-sm border-transparent"
                      : "bg-white/90 dark:bg-gray-800/90 text-gray-800 dark:text-gray-200 rounded-bl-sm border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm"
                  )} style={msg.role === "user" ? { background: `linear-gradient(to right, ${chatColor}, #9333ea)` } : {}}>
                    <div className={cn(
                      "h-8 w-8 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center",
                      msg.role === "user"
                        ? "bg-white/20"
                        : "bg-blue-600/20"
                    )}>
                      {msg.role === "user" ? (
                        <User className="h-4 w-4 text-white/80" />
                      ) : (
                        <Bot className="h-4 w-4" style={{ color: chatColor }} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm">
                        <MessageContent content={msg.content} isUser={msg.role === "user"} file={msg.file} />
                      </div>
                      <div className="mt-1 text-xs text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
                        {msg.timestamp?.toLocaleTimeString(context.userLang === 'vi' ? 'vi-VN' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2 opacity-100 transition-opacity pt-2 border-t border-gray-200/50 dark:border-gray-700/50">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateMessage(msg.id, { liked: !msg.liked, disliked: false })}
                        className="h-6 w-6 p-0 hover:bg-green-100 dark:hover:bg-green-900/50"
                      >
                        <ThumbsUp className={cn("h-4 w-4 transition-colors", msg.liked ? "fill-green-500 text-green-500" : "text-gray-500")} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateMessage(msg.id, { disliked: !msg.disliked, liked: false })}
                        className="h-6 w-6 p-0 hover:bg-red-100 dark:hover:bg-red-900/50"
                      >
                        <ThumbsDown className={cn("h-4 w-4 transition-colors", msg.disliked ? "fill-red-500 text-red-500" : "text-gray-500")} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className={cn(
                          "h-6 w-6 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 relative overflow-hidden transition-all duration-200",
                          copiedIds.has(msg.id) && "bg-green-100 dark:bg-green-900/50"
                        )}
                      >
                        <Copy 
                          className={cn(
                            "h-4 w-4 transition-all duration-300 ease-in-out",
                            copiedIds.has(msg.id) 
                              ? "animate-spin text-green-600" 
                              : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                          )} 
                        />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {showTyping && typingResponse && (
                <div className="flex justify-start animate-in slide-in-from-bottom-2 duration-300">
                  <TypingMessage fullContent={typingResponse} onComplete={handleTypingComplete} chatColor={chatColor} />
                </div>
              )}
              {isLoading && !showTyping && (
                <div className="flex justify-start animate-in slide-in-from-bottom-2 duration-300">
                  <div className="bg-white/90 dark:bg-gray-800/90 rounded-2xl px-4 py-3 border border-gray-200/50 dark:border-gray-700/50 shadow-sm flex items-center gap-2 backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" style={{ color: chatColor }} />
                      <span className="text-sm text-gray-600 dark:text-gray-400 font-medium" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
                        {getLangText("Đang suy nghĩ... 💭", "Đang OverThinking... 💭")}
                      </span>
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

            {/* Ô nhập với Prediction - thêm nút upload file/ảnh, sử dụng Textarea cho multiline, thêm nút mic */}
            <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm relative">
              <div className="relative flex flex-col"> {/* Thay đổi layout để hỗ trợ height động */}
                {/* Voice Indicator (thanh nói) - dynamic lang */}
                {isListening && <VoiceIndicator lang={context.userLang} chatColor={chatColor} />}

                {/* Ô nhập nội dung - Textarea với auto-grow và wrap */}
                <Textarea
                  ref={inputRef}
                  value={displayedInput} // Hiển thị interim tạm thời
                  onChange={(e) => {
                    setInput(e.target.value.replace(interimTranscript, '')); // Chỉ lưu final input, loại bỏ interim khi edit thủ công
                    setInterimTranscript(''); // Reset interim nếu user edit
                  }}
                  onKeyDown={handleKeyPress}
                  placeholder={
                    context.topic
                      ? `${getLangText(`Hỏi gì tiếp về mình đi ...`, ``)}`
                      : getLangText("Khai Thác Mình Đi... (VD: Dự án React? Kỹ năng Python?)", "")
                  }
                  disabled={isLoading || showTyping || isUploading}
                  className="flex-1 min-h-[44px] max-h-32 bg-white/80 dark:bg-gray-700/80 border-gray-300/50 dark:border-gray-600/50 
                             focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 
                             transition-all duration-200 placeholder-gray-500 
                             resize-none rounded-xl shadow-inner pr-12 pb-10 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]" // Điều chỉnh padding cho multiline và buttons, ẩn thanh cuộn
                  rows={1} // Bắt đầu với 1 row
                  style={{ 
                    overflowY: 'auto',
                    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' 
                  }} // Giữ overflow để scroll nếu cần, nhưng ẩn thanh cuộn
                />

                {/* File Input (ẩn) */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.js,.ts,.py,application/pdf,image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {/* Cụm nút bên phải - absolute positioning với top dynamic, thêm mic */}
                <div className="absolute bottom-3 right-2 flex items-center gap-1.5">
                  {/* Upload */}
                  <Button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading || showTyping || isUploading || isListening}
                    size="icon"
                    variant="ghost"
                    className="h-9 w-9 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 rounded-full transition"
                  >
                    {isUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-5 w-5" />
                    )}
                  </Button>

                  {/* Microphone - mới thêm */}
                  <Button
                    type="button"
                    onClick={toggleListening}
                    disabled={isLoading || showTyping || isUploading}
                    size="icon"
                    variant="ghost"
                    className={cn(
                      "h-9 w-9 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 rounded-full transition",
                      isListening && "bg-red-100 dark:bg-red-900/50 animate-pulse"
                    )}
                  >
                    {isListening ? (
                      <MicOff className="h-5 w-5 text-red-600" />
                    ) : (
                      <Mic className="h-5 w-5" />
                    )}
                  </Button>

                  {/* Emoji */}
                  <Button
                    type="button"
                    onClick={() => setShowEmojiPicker((prev) => !prev)}
                    disabled={isLoading || showTyping || isUploading || isListening}
                    size="icon"
                    variant="ghost"
                    className="h-9 w-9 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 rounded-full transition"
                  >
                    <Smile className="h-5 w-5" />
                  </Button>

                  {/* Gửi tin nhắn */}
                  <Button
                    onClick={sendMessage}
                    disabled={
                      isLoading || showTyping || isUploading || isListening || (!input.trim() && !selectedFile)
                    }
                    size="icon"
                    className="h-10 w-10 shadow-lg hover:shadow-purple-500/25 
                               transition-all duration-200 rounded-full"
                    style={{
                      background: `linear-gradient(to right, ${chatColor}, #a855f7)`,
                    }}
                  >
                    {isLoading || showTyping ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {/* File đã chọn - điều chỉnh vị trí */}
                {selectedFile && !isUploading && (
                  <div className="absolute left-2 bottom-3 flex items-center gap-1 bg-green-100 dark:bg-green-900/50 px-2 py-1 rounded-full text-xs max-w-[200px] truncate">
                    {selectedFile.type.startsWith("image/") ? (
                      <ImageIcon className="h-3 w-3" />
                    ) : (
                      <FileText className="h-3 w-3" />
                    )}
                    <span style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>{selectedFile.name.substring(0, 20)}...</span>
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