import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Chat from "./pages/Chat";
import NotFound from "./pages/NotFound";
import PrivateRouter from "./router/PrivateRouter";
import PublicRouter from "./router/PublicRouter";
import Test from "./pages/Test";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={
                <PublicRouter>
                  <Index />
                </PublicRouter>
              }
            />
            <Route
              path="/login"
              element={
                <PublicRouter>
                  <Login />
                </PublicRouter>
              }
            />
            <Route
              path="/test"
              element={
                <Test />
              }
            />
            <Route
              path="/register"
              element={
                <PublicRouter>
                  <Register />
                </PublicRouter>
              }
            />
            <Route
              path="/forgot-password"
              element={
                <PublicRouter>
                  <ForgotPassword />
                </PublicRouter>
              }
            />
            <Route
              path="/chat/:id?"
              element={
                <PrivateRouter>
                  <Chat />
                </PrivateRouter>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
