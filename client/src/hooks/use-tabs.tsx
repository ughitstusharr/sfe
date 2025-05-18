import { useState } from "react";

export function useTabs<T extends string>(
  initialTab: T,
  allTabs: readonly T[]
) {
  const [activeTab, setActiveTab] = useState<T>(initialTab);

  const isValidTab = (tab: T) => allTabs.includes(tab);

  const changeTab = (tab: T) => {
    if (isValidTab(tab)) {
      setActiveTab(tab);
      return true;
    }
    return false;
  };

  return {
    activeTab,
    setActiveTab: changeTab,
    isValidTab,
  };
}
