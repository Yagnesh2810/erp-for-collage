'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Wifi, RefreshCw, PlusCircle, Sparkles } from "lucide-react";

interface DashboardHeaderProps {
  user: any;
  isAuthenticated: boolean;
  socketConnected: boolean;
  refreshData?: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  user,
  isAuthenticated,
  socketConnected,
  refreshData
}) => {
  // Get current date and time
  const currentDate = new Date();
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(currentDate);

  const formattedTime = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(currentDate);

  const getGreeting = () => {
    const hour = currentDate.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fade-in">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            {getGreeting()}, {user?.name?.split(' ')[0] || 'Guest'}
          </h1>
          {isAuthenticated && <Sparkles className="h-5 w-5 text-yellow-500 animate-pulse" />}
        </div>
        <div className="flex items-center text-sm text-muted-foreground/80 font-medium">
          <Calendar className="mr-1.5 h-3.5 w-3.5" />
          <span>{formattedDate}</span>
          <span className="mx-2 opacity-30">|</span>
          <Clock className="mr-1.5 h-3.5 w-3.5" />
          <span>{formattedTime}</span>
          {isAuthenticated && (
            <>
              <span className="mx-2 opacity-30">|</span>
              <div className={`flex items-center ${socketConnected ? 'text-emerald-500' : 'text-amber-500'}`}>
                <Wifi className="mr-1.5 h-3.5 w-3.5" />
                <span className="text-xs uppercase tracking-wider">{socketConnected ? 'Online' : 'Reconnecting'}</span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {isAuthenticated && (
          <>
            <Button
              variant="outline"
              size="sm"
              className="h-9 bg-background/50 backdrop-blur-sm border-border/50 hover:bg-accent hover:text-accent-foreground"
              onClick={() => refreshData?.()}
            >
              <RefreshCw className="mr-2 h-3.5 w-3.5" />
              Sync Data
            </Button>
            <Button
              size="sm"
              className="h-9 shadow-lg shadow-primary/25 bg-primary hover:bg-primary/90 transition-all active:scale-95"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              New Order
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardHeader;