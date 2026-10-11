import React, { createContext, useContext, useState, useCallback } from 'react';
import type { CursorVariant } from '../types';

interface CursorContextType {
  cursorVariant: CursorVariant;
  cursorText: string;
  setCursor: (variant: CursorVariant, text?: string) => void;
  resetCursor: () => void;
  isClicking: boolean;
  setIsClicking: (val: boolean) => void;
}

const CursorContext = createContext<CursorContextType | undefined>(undefined);

export const CursorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cursorVariant, setCursorVariant] = useState<CursorVariant>('default');
  const [cursorText, setCursorText] = useState<string>('');
  const [isClicking, setIsClicking] = useState<boolean>(false);

  const setCursor = useCallback((variant: CursorVariant, text: string = '') => {
    setCursorVariant(variant);
    setCursorText(text);
  }, []);

  const resetCursor = useCallback(() => {
    setCursorVariant('default');
    setCursorText('');
  }, []);

  return (
    <CursorContext.Provider
      value={{
        cursorVariant,
        cursorText,
        setCursor,
        resetCursor,
        isClicking,
        setIsClicking,
      }}
    >
      {children}
    </CursorContext.Provider>
  );
};

export const useCursor = () => {
  const context = useContext(CursorContext);
  if (!context) {
    throw new Error('useCursor must be used within a CursorProvider');
  }
  return context;
};
