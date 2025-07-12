import { ServiceRIS } from "./service-ris";
import config from "../mock/config.json";
interface IServicesManager {
  RISService: ServiceRIS;
}

const isHttps = window.location.protocol === "https:";

export const servicesManager: IServicesManager = {
  RISService: new ServiceRIS(isHttps ? config.serverConfig.HTTPS_RIS_SERVER : config.serverConfig.RIS_SERVER),
};
