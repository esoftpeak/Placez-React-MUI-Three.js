import React, { createContext, useContext, useState, ReactNode } from 'react';
import { HelpOptions } from './HelpOptions'

interface HelpContextProps {
  currentHelpOption: HelpOptions | null;
  setHelpOption: (option: HelpOptions | null) => void;
  showHelp: (option: HelpOptions) => void;
}

const HelpContext = createContext<HelpContextProps | undefined>(undefined);

export const HelpProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentHelpOption, setCurrentHelpOption] = useState<HelpOptions | null>(null);
  console.log(currentHelpOption)

  const setHelpOption = (option: HelpOptions | null) => {
    setCurrentHelpOption(option);
  };

  const showHelp = (option: HelpOptions) => {
    setHelpOption(option);
  };

  return (
    <HelpContext.Provider value={{ currentHelpOption, setHelpOption, showHelp }}>
      {children}
    </HelpContext.Provider>
  );
};

export const useHelp = () => {
  const context = useContext(HelpContext);
  if (context === undefined) {
    throw new Error('useHelp must be used within a HelpProvider');
  }
  return context;
};
