//path: frontend/src/components/Layout.tsx
"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Navbar from "./Navbar";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  LayoutDashboard,
  ShoppingCart,
  Users,
  Package,
  ClipboardList,
  Truck,
  BarChart3,
  Settings,
  Shield,
  DollarSign,
  FolderKanban,
  FileText
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

interface LayoutProps {
  children: React.ReactNode;
}

interface MenuItem {
  path: string;
  name: string;
  icon?: React.ElementType;
  access?: boolean;
  subItems?: SubMenuItem[];
}

interface SubMenuItem {
  path: string;
  name: string;
}

export default function Layout({ children }: LayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isRoot = user?.role === "root";
  const isSuperAdmin = user?.role === "super_admin";
  const isAdmin = user?.role === "admin";
  const isManager = user?.role as string === "manager" || isAdmin || isSuperAdmin || isRoot;

  const menuSections: { title: string; items: MenuItem[] }[] = [
    {
      title: "Main",
      items: [
        { path: "/dashboard", name: "Dashboard", icon: LayoutDashboard },
      ]
    },
    {
      title: "Sales & Relations",
      items: [
        { path: "/dashboard/products", name: "Products", icon: Package },
        { path: "/dashboard/orders", name: "Orders", icon: ShoppingCart },
        { path: "/dashboard/customers", name: "Customers", icon: Users },
        { path: "/dashboard/contacts", name: "Contacts", icon: Users },
      ]
    },
    {
      title: "Inventory & Supply",
      items: [
        { path: "/dashboard/inventory", name: "Inventory", icon: ClipboardList },
        { path: "/dashboard/suppliers", name: "Suppliers", icon: Truck },
      ]
    },
    {
      title: "Finance",
      items: [
        {
          path: "/dashboard/finance",
          name: "Finance",
          icon: DollarSign
        }
      ]
    },
    {
      title: "Human Resources",
      items: [
        { path: "/dashboard/users", name: "User Management", icon: Shield, access: isAdmin || isSuperAdmin || isRoot },
        {
          path: "/dashboard/employees",
          name: "Employees",
          icon: Users,
        }
      ]
    },
    {
      title: "Project Management",
      items: [
        {
          path: "/dashboard/projects",
          name: "Projects",
          icon: FolderKanban,
        }
      ]
    },
    {
      title: "Analytics",
      items: [
        { path: "/dashboard/reports", name: "Reports", icon: BarChart3, access: isManager },
      ]
    },
    {
      title: "System",
      items: [
        { path: "/dashboard/settings", name: "Settings", icon: Settings },
        { path: "/dashboard/admin", name: "Admin Controls", icon: Shield, access: isAdmin || isSuperAdmin || isRoot },
      ]
    }
  ];

  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;

    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setCollapsed(true);
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  }, [mounted]);

  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [pathname, isMobile]);

  const toggleSidebar = () => {
    if (isMobile) {
      setSidebarOpen(!sidebarOpen);
    } else {
      setCollapsed(!collapsed);
    }
  };

  const toggleMenu = (path: string) => {
    setExpandedMenus(prev =>
      prev.includes(path)
        ? prev.filter(p => p !== path)
        : [...prev, path]
    );
  };

  const isMenuExpanded = (path: string) => expandedMenus.includes(path);

  const isSubItemActive = (item: MenuItem) => {
    if (!item.subItems) return false;
    return item.subItems.some((subItem: SubMenuItem) => pathname === subItem.path);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside
        className={`${isMobile
          ? `fixed inset-y-0 left-0 z-50 w-64 bg-background/80 backdrop-blur-xl border-r border-border/50 shadow-2xl transform transition-transform duration-300 ease-out ${(!isMobile || sidebarOpen) ? "translate-x-0" : "-translate-x-full"
          }`
          : `${collapsed ? "w-20" : "w-72"} bg-background/50 backdrop-blur-md border-r border-border/50 transition-all duration-300 ease-in-out`
          } flex flex-col h-full z-40`}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border/50">
          {!collapsed && (
            <div className="flex items-center space-x-3 animate-fade-in">
              <div className="w-9 h-9 bg-primary rounded-xl shadow-lg ring-1 ring-white/10 flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">ERP</span>
              </div>
              <div>
                <h1 className="font-bold text-foreground leading-none">Hisab</h1>
                <span className="text-xs text-muted-foreground font-medium">Enterprise</span>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className={`p-0 w-8 h-8 rounded-full hover:bg-accent ${collapsed ? "mx-auto" : ""}`}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-6 px-3">
          <div className="space-y-6">
            {menuSections.map((section) => (
              <div key={section.title}>
                {!collapsed && (
                  <h3 className="px-4 text-xs font-bold text-muted-foreground/70 uppercase tracking-widest mb-3 animate-fade-in">
                    {section.title}
                  </h3>
                )}
                <div className="space-y-1">
                  {section.items.map((item) => {
                    if (item.access === false) return null;

                    const isActive = pathname === item.path || isSubItemActive(item);
                    const hasSubItems = item.subItems && item.subItems.length > 0;
                    const isExpanded = isMenuExpanded(item.path);
                    const Icon = item.icon || FileText;

                    return (
                      <div key={item.path}>
                        {hasSubItems ? (
                          <button
                            onClick={() => toggleMenu(item.path)}
                            className={`w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 group ${isActive
                              ? "bg-primary/10 text-primary shadow-sm"
                              : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                              }`}
                          >
                            <div className="flex items-center min-w-0">
                              <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`} />
                              {!collapsed && (
                                <span className="ml-3 truncate animate-fade-in">{item.name}</span>
                              )}
                            </div>
                            {!collapsed && (
                              <div className="ml-auto">
                                {isExpanded ? (
                                  <ChevronUp className="w-3.5 h-3.5 opacity-50" />
                                ) : (
                                  <ChevronDown className="w-3.5 h-3.5 opacity-50" />
                                )}
                              </div>
                            )}
                          </button>
                        ) : (
                          <Link href={item.path}>
                            <div
                              className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 group ${isActive
                                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                                }`}
                            >
                              <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"}`} />
                              {!collapsed && (
                                <span className="ml-3 truncate animate-fade-in">{item.name}</span>
                              )}
                            </div>
                          </Link>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* User Profile */}
        {user && (
          <div className="p-4 border-t border-border/50 bg-background/30 backdrop-blur-sm">
            <div className={`flex items-center ${collapsed ? "justify-center" : "space-x-3"}`}>
              <Avatar className="w-9 h-9 border-2 border-background shadow-sm ring-1 ring-border/50">
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-medium text-xs">
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="flex-1 min-w-0 animate-fade-in">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate capitalize">
                    {user.role}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </aside>

      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden bg-background/95">
        <div className="sticky top-0 z-30">
          <Navbar toggleSidebar={toggleSidebar} isMobile={isMobile} />
        </div>
        <main className="flex-1 overflow-y-auto no-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}