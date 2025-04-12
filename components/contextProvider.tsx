"use client";

import { createContext, useContext, ReactNode } from "react";
import {useUser} from "@clerk/clerk-react"


const GlobalStateContext = createContext({});

export const GlobalStateProvider = ({ children }: { children: ReactNode }) => {
  const signedInUser = useUser()
 
  return (
    <GlobalStateContext.Provider value={{ signedInUser }}>
      {children}
    </GlobalStateContext.Provider>
  );
};

export const useGlobalState = () => {
  const context = useContext(GlobalStateContext);
  if (!context) {
    throw new Error("useGlobalState must be used within a GlobalStateProvider");
  }
  return context;
};
