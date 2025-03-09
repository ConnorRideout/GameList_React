import React, { createContext, useContext, useEffect, useState } from 'react';

// Define the type for the context menu data
interface ContextMenuData {
  trigger: string;
  target: string | number;
}

// Create the context with a default value of null
const ContextMenuContext = createContext<ContextMenuData | null>(null);

export default function ContextMenuProvider({ children }: {children: React.ReactNode}) {
  const [contextMenuData, setContextMenuData] = useState<ContextMenuData | null>(null);

  useEffect(() => {
    // Use the onContextMenuAction method from the exposed API
    const unsubscribe = window.electron.onContextMenuAction((trigger, target) => {
      setContextMenuData({ trigger, target });
    });

    return () => {
      unsubscribe(); // Clean up the listener when unmounting
    };
  }, []);

  return (
    <ContextMenuContext.Provider value={contextMenuData}>
      {children}
    </ContextMenuContext.Provider>
  );
};

// Custom hook to use the context
export const useContextMenu = () => {
  const context = useContext(ContextMenuContext);
  if (context === undefined) {
    throw new Error('useContextMenu must be used within a ContextMenuProvider');
  }
  return context;
};
