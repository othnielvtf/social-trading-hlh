import React from 'react';
import type { FeedTab } from './types';

interface FeedTabsProps {
  activeTab: FeedTab;
  onChange: (tab: FeedTab) => void;
}

const tabs: { id: FeedTab; label: string }[] = [
  { id: 'for-you', label: 'For you' },
  { id: 'friends', label: 'Friends' },
  { id: 'on-chain', label: 'On-chain' },
];

export const FeedTabs: React.FC<FeedTabsProps> = ({ activeTab, onChange }) => {
  return (
    <div className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-border z-10">
      <div className="flex">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex-1 py-4 px-4 text-center relative font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
            }`}
          >
            <span className="text-[15px] text-muted-foreground">{tab.label}</span>
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-primary rounded-full" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
