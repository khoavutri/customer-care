import {
  createSearchParams,
  Navigate,
  RouteProps,
  useLocation,
} from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { servicesManager } from "@/service/service-manager";

export const hasAnyAuthority = (
  authorities: Array<string>,
  hasAnyAuthorities: Array<string>
) => {
  if (authorities && authorities.length !== 0) {
    if (hasAnyAuthorities.length === 0) {
      return true;
    }
    return hasAnyAuthorities.some((auth) => authorities.includes(auth));
  }
  return false;
};

type IOwnProps = RouteProps & {
  hasAnyAuthorities?: Array<string>;
  children: React.ReactNode;
};

const PrivateRouter = ({
  children,
  hasAnyAuthorities = [],
  ...rest
}: IOwnProps) => {
  const location = useLocation();

  if (!children) {
    throw new Error(
      `A component needs to be specified for private route for path ${
        (rest as any).path
      }`
    );
  }

  const [auth, setAuth] = useState(true);
  useEffect(() => {
    checkAuth();
  }, [location]);

  const checkAuth = async () => {
    try {
      const action = await servicesManager.RISService.checkAuth();
      if (action && action.status === 1) {
        setAuth(true);
        return;
      }
      setAuth(false);
    } catch (error) {
      console.error("Lỗi xác thực:", error);
      setAuth(false);
    }
  };

  if (auth) return children;
  return (
    <Navigate
      to={{
        pathname: `/login`,
        search: createSearchParams({
          return: location.pathname,
        }).toString(),
      }}
      replace={true}
      state={{ from: location }}
    />
  );
};

export default PrivateRouter;
