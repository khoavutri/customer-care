import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Send, Bot, User } from "lucide-react";
import ChatSidebar from "@/components/ChatSidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import ChatSidebarMobile from "@/components/ChatSidebarMobile";
import { setToken } from "@/manager/store-manager";
import { servicesManager } from "@/service/service-manager";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";
import { scrollBar } from "@/constant/constant";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Markdown from "@/components/markdown";
import { cleanCitations } from "@/util/clean-result";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  content: string;
  sender: "user" | "assistant";
  timestamp: Date;
}

const defaultSuggestions = [
  "Hôm nay đi đâu?",
  "Biển nào đẹp?",
  "Gợi ý khu du lịch sinh thái",
];

const preMessage: Array<Message> = [
  {
    id: "1",
    content:
      "Xin chào! Tôi là AI Assistant của bạn. Tôi có thể giúp gì cho bạn hôm nay?",
    sender: "assistant",
    timestamp: new Date(),
  },
];

const Chat = () => {
  const navigate = useNavigate();
  const params = useParams();
  const mobile = useIsMobile();
  const lastContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [lastContainerSize, setLastContainerSize] = useState({
    height: 0,
    width: 0,
  });
  const [messages, setMessages] = useState<Message[]>([]);
  const [history, setHistory] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "auto",
      block: "end",
    });
  };

  const chooseSuggestion = (text: string) => {
    console.log(text);
    setSuggestions([]);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);
    const action = await servicesManager.RISService.chat(
      inputMessage,
      params?.id || undefined
    );
    if (action && action.status === 1) {
      if (action?.data?.conversation && !params?.id) {
        navigate(`/chat/${action?.data?.conversationId}`);
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          content: action.data.reply,
          sender: "assistant",
          timestamp: action.data.created,
        },
      ]);
      setIsTyping(false);
    } else {
      setIsTyping(false);
      toast("Câu hỏi không thành công!");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleLogout = () => {
    setToken("");
    window.location.href = "/login";
  };

  const fetchHistoryList = async () => {
    const action = await servicesManager.RISService.getHistoryList();
    if (action && action.status === 1) {
      setHistory(action.data);
    }
  };

  const getMessageList = async (id: string) => {
    if (!id) {
      setMessages(preMessage);
      return;
    }
    const action = await servicesManager.RISService.getMessage(id);
    if (action && action.status === 1) {
      setMessages([
        ...preMessage,
        ...action.data.messages.map((item) => ({
          id: item.id,
          content: item.content,
          sender: item.sender,
          timestamp: item.timestamp,
        })),
      ]);
    }
  };

  const handleDeleteHistory = async (id: string) => {
    if (!id) {
      return;
    }
    const action = await servicesManager.RISService.deleteConversation(id);
    if (action && action.status === 1) {
      toast("Xóa đoạn chat thành công!");
      if (action.data.conversationId === params?.id) {
        navigate(`/chat`);
      } else {
        fetchHistoryList();
      }
    } else {
      toast("Xóa không thành công!");
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchHistoryList();
    getMessageList(params?.id);
    setSuggestions(defaultSuggestions);
  }, [params]);

  useEffect(() => {
    const updateSize = () => {
      if (lastContainerRef.current) {
        const { width, height } =
          lastContainerRef.current.getBoundingClientRect();
        setLastContainerSize({ width, height });
      }
    };
    const container = lastContainerRef.current;
    if (!container) return;

    updateSize();

    const resizeObserver = new ResizeObserver(() => {
      updateSize();
    });
    resizeObserver.observe(container);

    window.addEventListener("resize", updateSize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateSize);
    };
  }, []);

  const num = Math.floor(lastContainerSize.width / 180);
  return (
    <div className="flex bg-background" style={{ height: "100vh" }}>
      {mobile ? (
        <ChatSidebarMobile
          isOpen={sidebarCollapsed}
          onClose={() => setSidebarCollapsed(false)}
          handleLogout={handleLogout}
          list={history}
          handleDelete={handleDeleteHistory}
        />
      ) : (
        <ChatSidebar
          isCollapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          handleLogout={handleLogout}
          list={history}
          handleDelete={handleDeleteHistory}
        />
      )}
      <div className="flex flex-col flex-1">
        <header className="border-b bg-card/50 backdrop-blur-sm p-4 flex items-center justify-between">
          <div
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => setSidebarCollapsed((prev) => !prev)}
          >
            <div className="w-10 h-10 bg-chat-gradient rounded-xl flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-lg">AI Customer Support</h1>
              <p className="text-sm text-muted-foreground">
                Luôn sẵn sàng hỗ trợ bạn
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <ThemeToggle />
          </div>
        </header>
        {/* Messages */}
        <div
          className={`flex-1 overflow-y-auto p-4 space-y-4 ${scrollBar} ${
            mobile ? "mb-[80px]" : ""
          }`}
          style={{ backgroundColor: "222.2 84% 4.9%" }}
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start space-x-3 animate-fade-in ${
                message.sender === "user"
                  ? "flex-row-reverse space-x-reverse"
                  : ""
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.sender === "user" ? "bg-chat-primary" : "bg-muted"
                }`}
              >
                {message.sender === "user" ? (
                  <User className="w-4 h-4 text-white" />
                ) : (
                  <Bot className="w-4 h-4 text-muted-foreground" />
                )}
              </div>

              <div
                className={`chat-bubble ${
                  message.sender === "user"
                    ? "chat-bubble-user"
                    : "chat-bubble-assistant"
                }`}
              >
                <div className="text-sm leading-relaxed">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={Markdown}
                  >
                    {cleanCitations(message.content || "")}
                  </ReactMarkdown>
                </div>
                <p
                  className={`text-xs mt-1 opacity-70 ${
                    message.sender === "user"
                      ? "text-white/70"
                      : "text-muted-foreground"
                  }`}
                >
                  {new Date(message.timestamp).toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex items-start space-x-3 animate-fade-in">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <Bot className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="chat-bubble chat-bubble-assistant">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        {suggestions.length > 0 && (
          <AnimatePresence>
            <motion.div
              className="flex flex-wrap gap-2 w-full overflow-hidden pb-2 justify-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
              style={{
                width: lastContainerSize.width,
                backgroundColor: "transparent",
                position: "absolute",
                bottom: lastContainerSize.height,
              }}
            >
              {suggestions.slice(0, num).map((suggestion, index) => (
                <Button
                  style={{
                    display: "inline-block",
                    maxWidth: 180,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                  key={index}
                  variant="outline"
                  className="flex-shrink-0 text-sm py-1 px-4 hover:bg-chat-primary hover:text-white transition-transform hover:scale-105"
                  disabled={isTyping}
                  onClick={() => chooseSuggestion(suggestion)}
                >
                  {suggestion}
                </Button>
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Input */}
        {mobile ? (
          <div
            className="fixed bottom-0 left-0 right-0 p-4 z-10 h-[90px] bg-background"
            ref={lastContainerRef}
          >
            <div className="flex space-x-3 max-w-screen-md mx-auto">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nhập tin nhắn của bạn..."
                className="flex-1 h-10 rounded-xl"
                disabled={isTyping}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className="h-10 w-10 rounded-xl bg-chat-gradient hover:opacity-90 transition-opacity p-0"
              >
                <Send className="w-4 h-4 text-white" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center mb-[10px]">
              AI có thể mắc lỗi. Vui lòng kiểm tra thông tin quan trọng.
            </p>
          </div>
        ) : (
          <div
            className="border-t bg-card/50 backdrop-blur-sm p-4"
            ref={lastContainerRef}
          >
            <div className="flex space-x-3">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nhập tin nhắn của bạn..."
                className="flex-1 h-12 rounded-xl"
                disabled={isTyping}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className="h-12 w-12 rounded-xl bg-chat-gradient hover:opacity-90 transition-opacity p-0"
              >
                <Send className="w-4 h-4 text-white" />
              </Button>
            </div>

            <p className="text-xs text-muted-foreground mt-2 text-center">
              AI có thể mắc lỗi. Vui lòng kiểm tra thông tin quan trọng.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
