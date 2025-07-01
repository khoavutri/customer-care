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
}

export { ServiceRIS };
