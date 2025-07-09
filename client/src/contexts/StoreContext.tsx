import React, { createContext, useContext, useState, ReactNode } from 'react';

interface StoreState {
    [key: string]: any;
}

interface StoreContextType {
    store: StoreState;
    setStore: (updates: Partial<StoreState>) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const useStore = () => {
    const context = useContext(StoreContext);
    if (!context) {
        throw new Error('useStore phải được sử dụng bên trong StoreProvider');
    }
    return context;
};

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [store, setStoreState] = useState<StoreState>({});

    const setStore = (updates: Partial<StoreState>) => {
        setStoreState((prev) => ({ ...prev, ...updates }));
    };

    return (
        <StoreContext.Provider value={{ store, setStore }}>
            {children}
        </StoreContext.Provider>
    );
};