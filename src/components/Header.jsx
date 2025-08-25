"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LogOut,
  User,
  Settings,
  Trophy,
  Users,
  Calendar,
  BarChart3,
} from "lucide-react";

export default function Header({ user }) {
  const [showMenu, setShowMenu] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth", { method: "DELETE" });
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const navigationItems =
    user.role === "ADMIN"
      ? [
          { name: "Dashboard", href: "/admin", icon: BarChart3 },
          { name: "Players", href: "/admin/players", icon: Users },
          { name: "Matches", href: "/admin/matches", icon: Calendar },
        ]
      : [{ name: "Vote", href: "/user", icon: Trophy }];

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-black/20 backdrop-blur-lg border-b border-white/10 sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Trophy className="h-8 w-8 text-yellow-500" />
            <div>
              <h1 className="text-lg font-bold text-white">Sports Meet 2025</h1>
              <p className="text-xs text-gray-400">247 HealthMedPro</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <button
                  key={item.name}
                  onClick={() => router.push(item.href)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? "bg-yellow-500/20 text-yellow-400"
                      : "text-gray-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </button>
              );
            })}
          </nav>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-3 bg-white/10 rounded-lg px-4 py-2 hover:bg-white/20 transition-colors"
            >
              <User className="h-4 w-4" />
              <span className="text-sm font-medium">{user.secretCode}</span>
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  user.role === "ADMIN"
                    ? "bg-red-500/20 text-red-400"
                    : "bg-blue-500/20 text-blue-400"
                }`}
              >
                {user.role}
              </span>
            </button>

            {/* Mobile Navigation */}
            {user.role === "ADMIN" && (
              <div className="md:hidden mt-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.name}
                      onClick={() => router.push(item.href)}
                      className="flex items-center gap-2 w-full text-left px-4 py-2 text-gray-300 hover:bg-white/10 rounded-lg"
                    >
                      <Icon className="h-4 w-4" />
                      {item.name}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Dropdown Menu */}
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute right-0 mt-2 w-48 bg-gray-800/95 backdrop-blur-lg rounded-lg border border-white/10 shadow-lg"
              >
                <div className="py-2">
                  <div className="px-4 py-2 text-xs text-gray-400 border-b border-white/10">
                    Welcome, {user.secretCode}
                  </div>

                  <button
                    onClick={() => {
                      setShowMenu(false);
                      // Handle settings
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-white/10 transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </button>

                  <button
                    onClick={() => {
                      setShowMenu(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
}
