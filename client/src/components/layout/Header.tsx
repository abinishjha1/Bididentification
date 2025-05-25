import { useState } from "react";
import { useLocation } from "wouter";
import { 
  Search, 
  Bell, 
  ChevronDown,
  User,
  Settings,
  LogOut
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type HeaderProps = {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
};

export default function Header({ sidebarOpen, setSidebarOpen }: HeaderProps) {
  const [location] = useLocation();
  
  // Get page title based on current route
  const getPageTitle = () => {
    switch (location) {
      case "/": return "Dashboard";
      case "/emails": return "Email Processing";
      case "/bids": return "Bids";
      case "/projects": return "Projects";
      case "/contractors": return "Contractors";
      case "/contracts": return "Contracts";
      case "/classifications": return "Classifications";
      case "/settings": return "Settings";
      default: return "Not Found";
    }
  };

  return (
    <header className="bg-white shadow z-10">
      <div className="flex items-center justify-between h-16 px-6">
        <div className="flex items-center">
          <h2 className="text-xl font-semibold">{getPageTitle()}</h2>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={16} />
            <Input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 w-64"
            />
          </div>
          
          <NotificationsDropdown />
          <ProfileDropdown />
        </div>
      </div>
    </header>
  );
}

function NotificationsDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-neutral-600" />
          <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center bg-destructive text-destructive-foreground">
            3
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="px-4 py-2 border-b border-neutral-100">
          <h3 className="font-semibold">Notifications</h3>
        </div>
        <div className="max-h-64 overflow-y-auto">
          <NotificationItem 
            title="New bid submission"
            description="Office Renovation Project - BuildCorp"
            time="5 minutes ago"
          />
          <NotificationItem 
            title="Classification updated"
            description="IT Infrastructure Upgrade - Changed to High Value"
            time="2 hours ago"
          />
          <NotificationItem 
            title="Contract ready for review"
            description="Warehouse Construction - MegaBuild"
            time="Yesterday"
          />
        </div>
        <div className="px-4 py-2 border-t border-neutral-100">
          <a href="#" className="text-primary-600 text-sm font-medium">View all notifications</a>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function NotificationItem({ title, description, time }: { title: string; description: string; time: string }) {
  return (
    <a href="#" className="block px-4 py-2 hover:bg-neutral-50 border-b border-neutral-100">
      <p className="text-sm font-medium">{title}</p>
      <p className="text-xs text-neutral-500">{description}</p>
      <p className="text-xs text-neutral-400">{time}</p>
    </a>
  );
}

function ProfileDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center space-x-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100" alt="User profile" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <span className="font-medium">John Doe</span>
          <ChevronDown className="h-4 w-4 text-neutral-500" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem>
          <User className="mr-2 h-4 w-4" />
          <span>Your Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
