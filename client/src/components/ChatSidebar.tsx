import React, { useRef, useLayoutEffect, useState } from 'react';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Plus, Settings, LogOut } from 'lucide-react';
import { Button } from './ui/button';


interface Chat {
  conversationId?: string;
  title: string;
  preview: string;
  latestTimestamp?: string;
  updatedAt?: string;
}

interface ChatSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  handleLogout: () => void;
  list: Chat[];
}

const formatDate = (time?: string) =>
  time ? new Date(time).toLocaleDateString('vi-VN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Không rõ';

const ChatSidebar: React.FC<ChatSidebarProps> = ({ isCollapsed, onToggle, handleLogout, list }) => {
  const navigate = useNavigate();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const newChatRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [scrollAreaHeight, setScrollAreaHeight] = useState(400);

  useLayoutEffect(() => {
    const calculateHeight = () => {
      if (sidebarRef.current && headerRef.current && newChatRef.current && bottomRef.current) {
        const sidebarHeight = sidebarRef.current.offsetHeight;
        const headerHeight = headerRef.current.offsetHeight;
        const newChatHeight = newChatRef.current.offsetHeight;
        const bottomHeight = bottomRef.current.offsetHeight;
        const padding = 32; // px-4 = 16px trên/dưới
        const availableHeight = sidebarHeight - headerHeight - newChatHeight - bottomHeight - padding;
        setScrollAreaHeight(Math.max(availableHeight, 100));
      }
    };

    calculateHeight();
    const observer = new ResizeObserver(calculateHeight);
    if (sidebarRef.current) observer.observe(sidebarRef.current);
    return () => observer.disconnect();
  }, [isCollapsed, list.length]);

  return (
    <div
      ref={sidebarRef}
      className={`${isCollapsed ? 'w-16' : 'w-80'} bg-sidebar border-r border-sidebar-border h-full flex flex-col transition-all duration-300`}
    >
      {/* Header */}
      <div ref={headerRef} className="p-4 border-b border-sidebar-border">
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
      <div ref={newChatRef} className="p-4">
        <Button
          className={`${isCollapsed ? 'w-8 h-8 p-0' : 'w-full'} bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white transition-all duration-200`}
          onClick={() => navigate('/chat')}
        >
          <Plus className="h-4 w-4" />
          {!isCollapsed && <span className="ml-2">Cuộc trò chuyện mới</span>}
        </Button>
      </div>
      {/* Chat History */}
      {!isCollapsed && (
        <div className="flex-1 px-2">
          <div className="mb-4 flex-1">
            <h3 className="text-sm font-medium text-sidebar-foreground/70 mb-2">
              Lịch sử trò chuyện
            </h3>
            <ScrollArea.Root
              className='px-2'
              style={{
                width: '100%',
                borderRadius: '0.5rem',
                backgroundColor: 'inherit',
                height: scrollAreaHeight,
                overflow: 'hidden',
              }}
              type="hover"
              scrollHideDelay={400}
            >
              <ScrollArea.Viewport
                style={{ width: '100%', height: '100%' }}
              >
                <div className="space-y-2 p-2">
                  {list.map((chat, index) => (
                    <div
                      key={chat?.conversationId || index}
                      className="p-3 rounded-lg bg-sidebar-accent hover:bg-sidebar-accent/80 cursor-pointer transition-colors group"
                      aria-label={`Mở cuộc trò chuyện ${chat?.title}`}
                      onClick={() => navigate(`/chat/${chat?.conversationId}`)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && navigate(`/chat/${chat?.conversationId}`)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-sidebar-foreground truncate">
                            {chat?.title || 'Không tên'}
                          </h4>
                          <p className="text-xs text-sidebar-foreground/50 mt-2">
                            {formatDate(chat?.latestTimestamp || chat?.updatedAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea.Viewport>
              <ScrollArea.Scrollbar
                style={{
                  width: '0.625rem',
                  padding: '2px',
                  background: 'rgba(0, 0, 0, 0.05)',
                  transition: 'background 0.16s',
                }}
                orientation="vertical"
                onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(0, 0, 0, 0.1)')}
                onMouseOut={(e) => (e.currentTarget.style.background = 'rgba(0, 0, 0, 0.05)')}
              >
                <ScrollArea.Thumb
                  style={{
                    flex: 1,
                    background: 'rgba(0, 0, 0, 0.3)',
                    borderRadius: '10px',
                    transition: 'background 0.16s',
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(0, 0, 0, 0.5)')}
                  onMouseOut={(e) => (e.currentTarget.style.background = 'rgba(0, 0, 0, 0.3)')}
                />
              </ScrollArea.Scrollbar>
              <ScrollArea.Corner
                style={{ background: 'rgba(0, 0, 0, 0.1)' }}
              />
            </ScrollArea.Root>
          </div>
        </div>
      )}

      {/* Bottom Actions */}
      <div ref={bottomRef} className="p-4 border-t border-sidebar-border space-y-2">
        <Button
          variant="ghost"
          className={`${isCollapsed ? 'w-8 h-8 p-0' : 'w-full justify-start'} text-sidebar-foreground hover:bg-sidebar-accent`}
        >
          <Settings className="h-4 w-4" />
          {!isCollapsed && <span className="ml-2">Cài đặt</span>}
        </Button>
        <Button
          variant="ghost"
          onClick={handleLogout}
          className={`${isCollapsed ? 'w-8 h-8 p-0' : 'w-full justify-start'} text-sidebar-foreground hover:bg-sidebar-accent hover:text-red-500`}
        >
          <LogOut className="h-4 w-4" />
          {!isCollapsed && <span className="ml-2">Đăng xuất</span>}
        </Button>
      </div>
    </div>
  );
};

export default ChatSidebar;