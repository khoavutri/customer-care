import { ServiceRIS } from "./service-ris";
import config from "../mock/config.json";
interface IServicesManager {
  RISService: ServiceRIS;
}

export const servicesManager: IServicesManager = {
  RISService: new ServiceRIS(config.serverConfig.RIS_SERVER),
};
