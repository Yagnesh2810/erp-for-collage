"use client";

import { useState } from "react";
import OrderNotificationProvider from "@/components/OrderNotificationProvider";
import Link from "next/link";
import { Menu, Search, ChevronDown, Settings, LogOut, HelpCircle, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import ClientOnly from "@/components/ClientOnly";

import { useAuth } from "@/contexts/AuthContext";

interface NavbarProps {
  toggleSidebar: () => void;
  isMobile: boolean;
}

export default function Navbar({ toggleSidebar, isMobile }: NavbarProps) {
  const { logout, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  // Notifications logic handled in OrderNotificationProvider mostly, 
  // but kept dummy state reference if needed for other things.

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
  };

  return (
    <header className="h-16 border-b border-border/40 bg-background/80 backdrop-blur-md px-4 sm:px-6 sticky top-0 z-40 transition-all duration-200">
      <div className="flex h-full items-center justify-between">
        <div className="flex items-center gap-4">
          {isMobile && (
            <Button
              onClick={toggleSidebar}
              variant="ghost"
              size="icon"
              className="md:hidden -ml-2 hover:bg-accent/50"
              aria-label="Toggle sidebar"
            >
              <Menu className="h-5 w-5 text-foreground/70" />
            </Button>
          )}

          <form onSubmit={handleSearch} className="hidden md:block">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              </div>
              <Input
                type="text"
                placeholder="Search anything..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-72 pl-10 bg-secondary/50 border-transparent focus:bg-background focus:border-primary/20 focus:ring-2 focus:ring-primary/10 transition-all rounded-xl"
              />
            </div>
          </form>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4">
          <Button variant="ghost" size="icon" className="md:hidden text-muted-foreground">
            <Search className="h-5 w-5" />
          </Button>

          <ClientOnly fallback={<div className="w-9 h-9" />}>
            <ThemeSwitcher />
          </ClientOnly>

          {/* Notifications */}
          <div className="relative">
            <OrderNotificationProvider />
            {/* Note: OrderNotificationProvider likely renders its own Bell icon. 
                 If it doesn't, we might need a wrapper here. Assuming it works as is. */}
          </div>

          <div className="h-6 w-px bg-border/50 mx-2 hidden sm:block"></div>

          {/* User dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full ring-2 ring-transparent focus-visible:ring-primary/20 hover:bg-accent/50 p-0 overflow-hidden">
                <Avatar className="h-9 w-9 border border-border/50">
                  <AvatarFallback className="bg-primary/5 text-primary font-medium text-xs">
                    {user?.name?.substring(0, 2).toUpperCase() || 'US'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.name || 'User'}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email || 'user@example.com'}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <HelpCircle className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Support</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50/50 dark:focus:bg-red-900/10">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}