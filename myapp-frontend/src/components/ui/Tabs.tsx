import React, { useState } from 'react';

export interface TabItem {
  key: string;
  label: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
}

interface TabsProps {
  tabs: TabItem[];
  defaultTab?: string;
  activeTab?: string;
  onTabChange?: (key: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  defaultTab,
  activeTab: controlledTab,
  onTabChange,
  className = '',
}) => {
  const [internalTab, setInternalTab] = useState(defaultTab ?? tabs[0]?.key);
  const active = controlledTab ?? internalTab;

  const handleClick = (key: string) => {
    if (!controlledTab) setInternalTab(key);
    onTabChange?.(key);
  };

  const activeContent = tabs.find(t => t.key === active)?.content;

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Tab bar */}
      <div className="flex border-b border-slate-200">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => !tab.disabled && handleClick(tab.key)}
            disabled={tab.disabled}
            className={`px-5 py-3 text-sm font-medium transition-colors border-b-2 -mb-px
              ${active === tab.key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'}
              ${tab.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="pt-4">
        {activeContent}
      </div>
    </div>
  );
};

export default Tabs;
