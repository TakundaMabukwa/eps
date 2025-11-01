"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Briefcase,
  Building2,
  Car,
  ChartBar,
  DollarSign,
  Phone,
  PlusSquare,
  QrCode,
  Settings,
  Settings2Icon,
  Truck,
  Users,
  Wrench,
  Route,
  Construction,
} from "lucide-react";
import GlobalProvider from "@/context/global-context/provider";
import Image from "next/image";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

// Role-based navigation configuration
const roleNavigation = {
  admin: [
    { name: "Dashboard", href: "/dashboard", Icon: <ChartBar /> },
    // { name: "Jobs", href: "/jobs", Icon: <Briefcase /> },
    // { name: "Fleet Jobs", href: "/jobsFleet", Icon: <Briefcase /> },
    // { name: "Call Center", href: "/callcenter", Icon: <Phone /> },
    { name: "Load Plan", href: "/load-plan", Icon: <Route /> },
    { name: "Fuel Can Bus", href: "/fuel", Icon: <Truck /> },
    // { name: "Equipment", href: "/equipment", Icon: <Settings /> },
    // { name: "Fleet Manager", href: "/fleetManager", Icon: <Truck /> },
    { name: "Drivers", href: "/drivers", Icon: <Users /> },
    { name: "Vehicles", href: "/vehicles", Icon: <Car /> },
    // { name: "Customers", href: "/customer", Icon: <Building2 /> },
    { name: "Cost Centers", href: "/ccenter", Icon: <Construction /> },
    { name: "Financials", href: "/audit", Icon: <Settings2Icon /> },
    // { name: "Reports", href: "/reports", Icon: <ChartBar /> },
    // { name: "User Management", href: "/userManagement", Icon: <PlusSquare /> },
    // { name: "System Settings", href: "/settings", Icon: <Settings /> },
    {
      name: "Inspections",
      href: "/fleetManager/inspections",
      Icon: <QrCode />,
    },
  ],
  "fleet manager": [
    { name: "Dashboard", href: "/dashboard", Icon: <ChartBar /> },
    { name: "Load Plan", href: "/load-plan", Icon: <Route /> },
  ],
  fc: [
    { name: "Dashboard", href: "/dashboard", Icon: <ChartBar /> },
    { name: "Fleet Manager", href: "/fleetManager", Icon: <Truck /> },
    {
      name: "Inspections",
      href: "/fleetManager/inspections",
      Icon: <Briefcase />,
    },
    { name: "Jobs", href: "/jobsFleet", Icon: <Briefcase /> },
    { name: "Drivers", href: "/drivers", Icon: <Users /> },
    { name: "Vehicles", href: "/vehicles", Icon: <Car /> },
    { name: "Qoute Management", href: "/qoutation", Icon: <Building2 /> },
    // { name: 'Profile', href: '/profile', Icon: <Settings2Icon /> },
    { name: "System Settings", href: "/settings", Icon: <Settings /> },
    { name: "User Management", href: "/userManagement", Icon: <PlusSquare /> },
  ],
  "call centre": [
    { name: "Dashboard", href: "/dashboard", Icon: <ChartBar /> },
    { name: "Jobs", href: "/jobs", Icon: <Briefcase /> },
    { name: "Call Center", href: "/callcenter", Icon: <Phone /> },
    {
      name: "Technicians Assignment",
      href: "/callcenter/technician",
      Icon: <Wrench />,
    },
    {
      name: "Technician Vehicles",
      href: "/callcenter/breakdowns",
      Icon: <Truck />,
    },
    { name: "Workshops", href: "/callcenter/clients", Icon: <Users /> },
    { name: "Qoute Management", href: "/ccenter", Icon: <Building2 /> },
    // { name: 'Profile', href: '/profile', Icon: <Settings2Icon /> },
    { name: "System Settings", href: "/settings", Icon: <Settings /> },
  ],
  customer: [
    { name: "Dashboard", href: "/dashboard", Icon: <ChartBar /> },
    { name: "Drivers", href: "/drivers", Icon: <Users /> },
    { name: "Vehicles", href: "/vehicles", Icon: <Car /> },
    { name: "Fuel Can Bus", href: "/fuel", Icon: <Truck /> },
    { name: "Technicians Assignment", href: "/extechnicians", Icon: <Users /> },
    { name: "Workshop Vehicles", href: "/exvehicles", Icon: <Car /> },
    { name: "Qoute Management", href: "/workshopQoute", Icon: <Building2 /> },
    // { name: "System Settings", href: "/settings", Icon: <Settings /> },
  ],
  "cost centre": [
    { name: "Dashboard", href: "/dashboard", Icon: <ChartBar /> },
    { name: "Cost", href: "/ccenter", Icon: <Building2 /> },
    {
      name: "Qoute Management",
      href: "/ccenter/create-qoutation",
      Icon: <DollarSign />,
    },
    // { name: 'Profile', href: '/profile', Icon: <Settings2Icon /> },
    { name: "System Settings", href: "/settings", Icon: <Settings /> },
  ],
};

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userRole, setUserRole] = useState<string>("");
  const [navigation, setNavigation] = useState<any[]>([]);
  const pathname = usePathname();

  useEffect(() => {
    // Get user role from cookies
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(";").shift();
      return null;
    };

    const role = decodeURIComponent(getCookie("role") || "");
    const session = getCookie("session");

    console.log("Layout - Session cookie:", session ? "exists" : "missing");
    console.log("Layout - Role cookie:", role || "missing");

    if (role) {
      setUserRole(role);
      // Set navigation based on role
      const roleNav = roleNavigation[role as keyof typeof roleNavigation] || [];

      // Force fleet manager to only have 2 items
      if (role === "fleet manager") {
        const fleetManagerNav = [
          { name: "Dashboard", href: "/dashboard", Icon: <ChartBar /> },
          { name: "Load Plan", href: "/load-plan", Icon: <Route /> },
        ];
        setNavigation(fleetManagerNav);
        console.log(
          "Layout - Fleet Manager restricted to 2 items:",
          fleetManagerNav.length
        );
      } else if (role === "customer") {
        const customerNav = [
          { name: "Drivers", href: "/drivers", Icon: <Users /> },
          { name: "Vehicles", href: "/vehicles", Icon: <Car /> },
          {
            name: "Inspections",
            href: "/fleetManager/inspections",
            Icon: <QrCode />,
          },
          { name: "Fuel Can Bus", href: "/fuel", Icon: <Truck /> },
        ];
        setNavigation(customerNav);
        console.log(
          "Layout - Customer restricted to 4 items:",
          customerNav.length
        );
      } else {
        setNavigation(roleNav);
      }

      console.log(
        "Layout - Navigation set for role:",
        role,
        "Items:",
        navigation.length || roleNav.length
      );
    } else {
      console.log("Layout - No role found, redirecting to login");
      window.location.href = "/login";
    }
  }, []);

  const handleLogout = () => {
    window.location.href = "/logout";
  };

  return (
    <div className="flex bg-gray-50 w-full">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-blue-500 via-blue-800 to-blue-900 text-white shadow-2xl
      transform transition-transform duration-300 ease-in-out
      ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      lg:translate-x-0 h-screen flex flex-col`}
      >
        {/* Header */}
        <div className="p-5 border-b border-blue-600/40 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <img
              src="/Logo.png"
              alt="EPS Couriers Logo"
              className="h-10 w-auto rounded-lg bg-white p-1 shadow-md"
            />
            <h1 className="text-xl font-bold tracking-wide text-white">
              EPS Couriers
            </h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white hover:bg-blue-700/40"
          >
            ✕
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150
              ${
                isActive
                  ? "bg-white text-blue-800 shadow-md border-l-4 border-orange-500"
                  : "text-gray-200 hover:bg-blue-700/40 hover:text-white"
              }`}
              >
                <span className="mr-3">{item.Icon}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-blue-700/40 bg-blue-950/30">
          <div className="text-center text-xs text-gray-300 mb-2">
            Role:{" "}
            {userRole
              ? userRole === "customer"
                ? "Workshop"
                : userRole
              : "No User"}
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full bg-red-500 text-white border-white/20 hover:bg-red-600 hover:border-black/30"
          >
            🚪 Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64 flex-1 h-screen overflow-y-auto">
        {/* Top Bar */}
        <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-sm border-b shadow-sm">
          <div className="flex items-center justify-between px-4 py-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden"
            >
              ☰
            </Button>
            <div className="flex items-center space-x-4">
              <div className="flex flex-col">
              <span className="text-sm text-gray-500">Welcome back</span>
              <span className="text-sm font-semibold text-gray-800">
                {userRole
                ? userRole === "customer"
                  ? "Workshop"
                  : userRole.charAt(0).toUpperCase() + userRole.slice(1)
                : "User"}
              </span>
              </div>
              <div className="flex flex-col items-end">
              <span className="text-xs text-gray-400">
                {new Date().toLocaleDateString(undefined, {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
                })}
              </span>
              <span className="text-sm font-medium text-gray-700">
                {new Date().toLocaleTimeString(undefined, {
                hour: "2-digit",
                minute: "2-digit",
                })}
              </span>
              </div> 
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="p-6 bg-gray-90 min-h-screen">
          <div className="mx-auto">
            <GlobalProvider>{children}</GlobalProvider>
          </div>
        </main>
      </div>
    </div>
  );
}
