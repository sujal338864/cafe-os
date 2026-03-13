"use client";

import { Bell, Search, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <nav className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            placeholder="Search..."
            className="pl-10 bg-slate-800 border-slate-700 text-white placeholder-slate-500"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4 ml-auto">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
          <Bell className="w-5 h-5" />
        </Button>

        {/* User Menu */}
        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
          <User className="w-5 h-5" />
        </Button>
      </div>
    </nav>
  );
}
