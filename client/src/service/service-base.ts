import { getToken, setToken } from "@/manager/store-manager";
import axios from "axios";

const TIMEOUT = 1 * 60 * 100000;

class ServiceBase {
  service: any;
  baseURL: string;
  constructor(baseURL: string) {
    const service = axios.create({
      headers: {
        csrf: "token",
        "Access-Control-Allow-Origin": "*",
      },
      timeout: TIMEOUT,
      baseURL,
    });
    this.baseURL = baseURL;
    service.interceptors.request.use(this.requestSuccess);
    service.interceptors.response.use(this.handleSuccess, this.handleError);
    this.service = service;

    // this.addToken(getToken() || "");
  }

  addToken = (token: string) => {
    this.service.defaults.headers.common.Authorization = "Bearer " + token;
    setToken(token);
  };

  requestSuccess = (config: any) => {
    // config.headers["Accept-Language"] = getLanguage();
    const token = getToken();
    config.headers.Authorization = `Bearer ${token}`;
    return config;
  };

  handleSuccess(response: any) {
    try {
      if (response.data.status !== 1) {
        // cần test
        // message.destroy();
        // message.error(JSON.parse(response.data.message).detail);
      }
    } catch (error) { }
    return response.data;
  }

  handleError = (error: any | undefined) => {
    switch (error?.response?.status) {
      case 401:
        return Promise.reject(error?.response?.status);
      case 403:
        break;

      default:
        break;
    }
    return error?.response
      ? Promise.reject(error?.response.data)
      : Promise.reject(error);
  };

  redirectTo = (document: any, path: string) => {
    document.location = path;
  };

  request = (config: any) => {
    return this.service(config);
  };
}

export { ServiceBase };
