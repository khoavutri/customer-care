import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Settings, LogOut, X, Trash } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDate } from "@/util/format-date";

interface ChatSidebarMobileProps {
  isOpen: boolean;
  onClose: () => void;
  handleLogout: () => void;
  list: Array<any>;
  handleDelete: (id: string) => void;
}

const ChatSidebarMobile = ({
  isOpen,
  onClose,
  handleLogout,
  list,
  handleDelete,
}: ChatSidebarMobileProps) => {
  const navigate = useNavigate();

  return (
    <div
      className={`fixed inset-0 bg-sidebar z-50 flex flex-col max-h-[100dvh] w-[90vw] max-w-[320px] transition-all duration-300 ease-in-out ${
        isOpen ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"
      }`}
    >
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border flex justify-between items-center shrink-0">
        <h2 className="text-lg font-semibold text-sidebar-foreground">
          AI Chat Assistant
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-10 w-10 text-sidebar-foreground hover:bg-sidebar-accent"
          aria-label="Đóng menu"
        >
          <X className="h-6 w-6" />
        </Button>
      </div>

      {/* New Chat Button */}
      <div className="p-4 shrink-0">
        <Button
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white h-12 text-base"
          onClick={() => {
            navigate(`/chat`);
            onClose();
          }}
        >
          <Plus className="h-5 w-5 mr-2" />
          Cuộc trò chuyện mới
        </Button>
      </div>

      {/* Chat History */}
      <div className="flex-1 px-2 min-h-0 flex flex-col mb-3">
        <div className="mb-4 flex-1 min-h-0">
          <h3 className="text-sm font-medium text-sidebar-foreground/70 mb-2 px-1">
            Lịch sử trò chuyện
          </h3>
          <ScrollArea className="h-full">
            <div className="space-y-3 px-3 pb-4 mt-1">
              {list.map((chat, index) => (
                <div
                  key={chat?.conversationId || index}
                  className="p-4 rounded-lg bg-sidebar-accent hover:bg-sidebar-accent/80 cursor-pointer transition-colors"
                  onClick={() => {
                    navigate(`/chat/${chat?.conversationId}`);
                    onClose();
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`Mở cuộc trò chuyện ${chat?.title}`}
                >
                  <h4 className="flex justify-between text-sm font-medium text-sidebar-foreground">
                    <span className="truncate">
                      {chat?.title || "Không tên"}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="ml-2 p-2 h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/50 
                               rounded-full transition-colors duration-150 group"
                      title="Xóa cuộc trò chuyện"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(chat?.conversationId);
                      }}
                    >
                      <Trash className="w-4 h-4 group-hover:scale-110 transition-transform duration-150" />
                    </Button>
                  </h4>
                  <p className="text-sm text-sidebar-foreground/60 mt-1 line-clamp-2">
                    {chat.preview}
                  </p>
                  <p className="text-xs text-sidebar-foreground/50 mt-2">
                    {formatDate(chat?.latestTimestamp || chat?.updatedAt)}
                  </p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      <div className="p-4 border-t border-sidebar-border space-y-2 shrink-0">
        <Button
          variant="ghost"
          className="w-full h-12 justify-start text-sidebar-foreground hover:bg-sidebar-accent text-base"
          aria-label="Mở cài đặt"
        >
          <Settings className="h-5 w-5 mr-2" />
          Cài đặt
        </Button>
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full h-12 justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-red-500 text-base"
          aria-label="Đăng xuất"
        >
          <LogOut className="h-5 w-5 mr-2" />
          Đăng xuất
        </Button>
      </div>
    </div>
  );
};

export default ChatSidebarMobile;
