"use client"
import { createContext, useState, useContext, ReactNode } from "react";
import * as THREE from 'three';

interface DirectionContextType {
  direction: THREE.Vector3 | null;
  setDirection: React.Dispatch<React.SetStateAction<THREE.Vector3 | null>>;
}

const DirectionContext = createContext<DirectionContextType | undefined>(undefined);

interface DirectionProviderProps {
  children: ReactNode;
}

export const DirectionProvider: React.FC<DirectionProviderProps> = ({ children }) => {
  const [direction, setDirection] = useState<THREE.Vector3 | null>(null);

  return (
    <DirectionContext.Provider value={{ direction, setDirection }}>
      {children}
    </DirectionContext.Provider>
  )
}

export const useDirection = () => {
  const context = useContext(DirectionContext);
  if (!context) {
    throw new Error('useDirection must be used within a DirectionProvider');
  }
  return context;
}