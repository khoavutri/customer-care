import { ServiceBase } from "./service-base";

class ServiceRIS extends ServiceBase {
  constructor(baseURL: string) {
    super(baseURL);
  }

  test = async (prompt: string) => {
    const url = "/user/query";
    const response = await this.service.post(url, { prompt });
    return response;
  };

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

  createLabel = async (data: { password: string; email: string; name: string }) => {
    const url = "/admin/create-label";
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
    const response = await this.service.post(url,
      {
        prompt: prompt.trim(),
        conversationId,
        date: new Date().toISOString()
      });
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

  grantAdmin = async (id: string) => {
    const url = `/admin/grant-admin`;
    const response = await this.service.put(url, { userId: id });
    return response;
  };

  getSuggestions = async (conversationId?: string) => {
    const url = conversationId
      ? `/user/suggestions/${conversationId}`
      : `/user/suggestions`;

    const response = await this.service.get(url);
    return response;
  };

  deleteUser = async (id: string) => {
    const url = `/admin/delete-user/${id}`;
    const response = await this.service.delete(url);
    return response;
  };

  cleanUp = async () => {
    const url = `/admin/clean-up`;
    const response = await this.service.delete(url);
    return response;
  };

  uploadDataTrain = async (file: File) => {
    const url = "/admin/upload-json";
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.service.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response;
  };

  uploadLabel = async (file: File) => {
    const url = "/admin/upload-label";
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.service.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response;
  };

  getUserList = async (params: {
    page?: number,
    pageSize?: number,
    name?: string,
    email: string,
  }) => {
    const url = "/admin/user-list";
    const { page = 1, pageSize = 3, name = "", email } = params;
    const response = await this.service.post(url, {
      page: page,
      pageSize: pageSize,
      name: name,
      email,
    });
    return response;

  };
}

export { ServiceRIS };
