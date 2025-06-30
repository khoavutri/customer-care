import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Plus, Settings, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

interface ChatHistory {
  id: string;
  title: string;
  timestamp: string;
  preview: string;
}

interface ChatSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const ChatSidebar = ({ isCollapsed, onToggle }: ChatSidebarProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile()
  const [chatHistory] = useState<ChatHistory[]>([
    {
      id: "1",
      title: "Tư vấn marketing",
      timestamp: "2 giờ trước",
      preview: "Làm thế nào để tăng traffic website?",
    },
    {
      id: "2",
      title: "Phân tích đối thủ",
      timestamp: "1 ngày trước",
      preview: "Phân tích chiến lược marketing của đối thủ",
    },
    {
      id: "3",
      title: "SEO optimization",
      timestamp: "3 ngày trước",
      preview: "Tối ưu hóa SEO cho website bán hàng",
    },
    {
      id: "4",
      title: "Content strategy",
      timestamp: "1 tuần trước",
      preview: "Lập kế hoạch content cho 3 tháng",
    },
  ]);

  const handleLogout = () => {
    navigate("/login");
  };


  return (
    <div
      className={`${isCollapsed ? "w-16" : "w-80"
        } bg-sidebar border-r border-sidebar-border h-full flex flex-col transition-all duration-300`}
    >
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <h2 className="text-lg font-semibold text-sidebar-foreground">
              AI Chat Assistant
            </h2>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <MessageSquare className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* New Chat Button */}
      <div className="p-4">
        <Button
          className={`${isCollapsed ? "w-8 h-8 p-0" : "w-full"
            } bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white transition-all duration-200`}
          onClick={() => window.location.reload()}
        >
          <Plus className="h-4 w-4" />
          {!isCollapsed && <span className="ml-2">Cuộc trò chuyện mới</span>}
        </Button>
      </div>

      {/* Chat History */}
      {!isCollapsed && (
        <div className="flex-1 px-4">
          <div className="mb-4">
            <h3 className="text-sm font-medium text-sidebar-foreground/70 mb-2">
              Lịch sử trò chuyện
            </h3>
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {chatHistory.map((chat) => (
                  <div
                    key={chat.id}
                    className="p-3 rounded-lg bg-sidebar-accent hover:bg-sidebar-accent/80 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-sidebar-foreground truncate">
                          {chat.title}
                        </h4>
                        <p className="text-xs text-sidebar-foreground/60 mt-1 line-clamp-2">
                          {chat.preview}
                        </p>
                        <p className="text-xs text-sidebar-foreground/50 mt-2">
                          {chat.timestamp}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      )}

      {/* Bottom Actions */}
      <div className="p-4 border-t border-sidebar-border space-y-2">
        <Button
          variant="ghost"
          className={`${isCollapsed ? "w-8 h-8 p-0" : "w-full justify-start"
            } text-sidebar-foreground hover:bg-sidebar-accent`}
        >
          <Settings className="h-4 w-4" />
          {!isCollapsed && <span className="ml-2">Cài đặt</span>}
        </Button>
        <Button
          variant="ghost"
          onClick={handleLogout}
          className={`${isCollapsed ? "w-8 h-8 p-0" : "w-full justify-start"
            } text-sidebar-foreground hover:bg-sidebar-accent hover:text-red-500`}
        >
          <LogOut className="h-4 w-4" />
          {!isCollapsed && <span className="ml-2">Đăng xuất</span>}
        </Button>
      </div>
    </div>
  );
};

export default ChatSidebar;
