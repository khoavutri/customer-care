import { ServiceBase } from "./service-base";

class ServiceRIS extends ServiceBase {
  constructor(baseURL: string) {
    super(baseURL);
  }

  login = async (data: { username: string; password: string }) => {
    const url = "/auth/login";
    const response = await this.service.post(url, data);
    return response;
  };

  signup = async (data: { password: string; email: string; name: string }) => {
    const url = "/auth/signup";
    const response = await this.service.post(url, data);
    return response;
  };

  checkAuth = async () => {
    const url = "/user/check-auth";
    const response = await this.service.get(url);
    return response;
  };

  chat = async (prompt: string, conversationId?: any) => {
    const url = "/user/chat";
    const response = await this.service.post(url, { prompt: prompt.trim(), conversationId, date: new Date().toISOString() });
    return response;
  };

  getHistoryList = async () => {
    const url = "/user/history-list";
    const response = await this.service.get(url);
    return response;
  };

  getMessage = async (id: string) => {
    const url = `/user/message/${id}`;
    const response = await this.service.get(url);
    return response;
  };

  deleteConversation = async (id: string) => {
    const url = `/user/delete-conversation/${id}`;
    const response = await this.service.delete(url);
    return response;
  };
}

export { ServiceRIS };
