import { Navigate, RouteProps, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { servicesManager } from "@/service/service-manager";

type IOwnProps = RouteProps & {
  children: React.ReactNode;
};

const PublicRouter = ({ children }: IOwnProps) => {
  const location = useLocation();

  useEffect(() => {
    checkAuth();
  }, [location]);

  const checkAuth = async () => {
    const action = await servicesManager.RISService.checkAuth();
    if (action && action.status === 1) {
      window.location.href = "/chat";
    }
  };

  return children;
};

export default PublicRouter;
