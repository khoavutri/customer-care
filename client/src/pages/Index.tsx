
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Bot, MessageCircle, Zap, Shield, ArrowRight } from 'lucide-react';
import { scrollBar } from '@/constant/constant';

const Index = () => {
  return (
    <div
      style={{ overflow: 'auto', height: "100vh" }}
      className={`min-h-screen bg-gradient-to-br 
      from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 ${scrollBar}`}>
      {/* Header */}
      <header className="p-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-chat-gradient rounded-xl flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold gradient-text">AI Support</h1>
        </div>
        <ThemeToggle />
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <div className="animate-bounce-in">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="gradient-text">Tư vấn khách hàng</span>
              <br />
              <span className="text-foreground">thông minh với AI</span>
            </h1>

            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
              Trải nghiệm dịch vụ hỗ trợ khách hàng 24/7 với công nghệ AI tiên tiến.
              Nhanh chóng, chính xác và luôn sẵn sàng giúp đỡ bạn.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link to="/register">
                <Button size="lg" className="h-14 px-8 bg-chat-gradient hover:opacity-90 transition-opacity text-white font-medium shadow-2xl">
                  Bắt đầu ngay
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>

              <Link to="/login">
                <Button variant="outline" size="lg" className="h-14 px-8 border-2 border-primary/20 hover:border-primary/40 transition-colors">
                  Đăng nhập
                </Button>
              </Link>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mt-20 animate-fade-in">
            <div className="p-8 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 shadow-xl hover:shadow-2xl transition-shadow">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <MessageCircle className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-4">Trò chuyện thông minh</h3>
              <p className="text-muted-foreground leading-relaxed">
                AI hiểu ngữ cảnh và cung cấp câu trả lời chính xác, phù hợp với từng tình huống cụ thể.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 shadow-xl hover:shadow-2xl transition-shadow">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <Zap className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-bold mb-4">Phản hồi tức thì</h3>
              <p className="text-muted-foreground leading-relaxed">
                Không cần chờ đợi. Nhận được hỗ trợ ngay lập tức bất kỳ lúc nào trong ngày.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 shadow-xl hover:shadow-2xl transition-shadow">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <Shield className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-bold mb-4">Bảo mật tuyệt đối</h3>
              <p className="text-muted-foreground leading-relaxed">
                Thông tin của bạn được bảo vệ bằng công nghệ mã hóa tiên tiến nhất.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 mt-20 py-8">
        <div className="container mx-auto px-6 text-center text-muted-foreground">
          <p>&copy; 2024 AI Support. Tất cả quyền được bảo lưu.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
