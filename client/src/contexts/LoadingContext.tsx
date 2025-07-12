import LoadingBase from "@/components/loading/LoadingBase";
import React, { createContext, useContext, useState, ReactNode } from "react";
interface LoadingContextType {
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading phải được sử dụng bên trong LoadingProvider");
  }
  return context;
};

export const LoadingProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isLoading, setLoading] = useState<boolean>(false);

  return (
    <LoadingContext.Provider value={{ isLoading, setLoading }}>
      {isLoading && <LoadingBase />}
      {children}
    </LoadingContext.Provider>
  );
};
