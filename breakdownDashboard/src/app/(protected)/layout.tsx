"use client";

import { useState, useEffect, use } from "react";
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
} from "lucide-react";
import GlobalProvider from "@/context/global-context/provider";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

// Role-based navigation configuration
const roleNavigation = {
  "fleet manager": [
    { name: "Dashboard", href: "/dashboard", Icon: <ChartBar /> },
    { name: "Jobs", href: "/jobsFleet", Icon: <Briefcase /> },
    {
      name: "Inspections",
      href: "/fleetManager/inspections",
      Icon: <QrCode />,
    },
    { name: "Drivers", href: "/drivers", Icon: <Users /> },
    { name: "Vehicles", href: "/vehicles", Icon: <Car /> },
    {
      name: "Cost Centres",
      href: "/fleetManager/cost-centres",
      Icon: <Wrench />,
    },
    { name: "Clients", href: "/fleetManager/clients", Icon: <Building2 /> },
    // { name: "Stop Points", href: "/fleetManager/stop-points", Icon: <Route /> },
    { name: "Trips", href: "/fleetManager/trips", Icon: <Route /> },
    // { name: "Routes", href: "/fleetManager/routes", Icon: <Truck /> },

    // { name: 'Qoute Management', href: '/qoutation', Icon: <Building2 /> },
    // { name: 'Profile', href: '/profile', Icon: <Settings2Icon /> },
    { name: "System Settings", href: "/settings", Icon: <Settings /> },
    // { name: 'User Management', href: '/userManagement', Icon: <PlusSquare /> },
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
    { name: "Technicians Assignment", href: "/extechnicians", Icon: <Users /> },
    { name: "Workshop Vehicles", href: "/exvehicles", Icon: <Car /> },
    { name: "Qoute Management", href: "/workshopQoute", Icon: <Building2 /> },
    // { name: 'User Management', href: '/userManagement', Icon: <PlusSquare /> },
    // { name: 'Profile', href: '/profile', Icon: <Settings2Icon /> },
    { name: "System Settings", href: "/settings", Icon: <Settings /> },
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
      setNavigation(roleNav);
      console.log(
        "Layout - Navigation set for role:",
        role,
        "Items:",
        roleNav.length
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
    <div className="bg-gray-50 w-full">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden w-full"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar: this is sticky/fixed and does NOT move */}
      <div
        className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
        h-screen
      `}
      >
        {/* Header, nav, footer go here */}
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h1 className="text-xl font-bold text-gray-900">
              Breakdown Logistics
            </h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden"
            >
              ✕
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              // const isActive = pathname.startsWith(item.href)
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                    ${
                      isActive
                        ? "bg-blue-100 text-blue-700 border-r-2 border-blue-700"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }
                  `}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="mr-3">{item.Icon}</span>
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t">
            <div className="mb-2 text-xs text-gray-500 text-center">
              Role:{" "}
              {userRole
                ? userRole === "customer"
                  ? "workshop"
                  : userRole
                : "No User"}
            </div>
            <Button onClick={handleLogout} variant="outline" className="w-full">
              🚪 Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main content: this scrolls */}
      <div className="ml-64 h-screen overflow-y-auto">
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-white border-b shadow-sm">
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
              <span className="text-sm text-gray-600">Welcome back</span>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-6 w-full">
          <Card className="p-6">
            <GlobalProvider>{children}</GlobalProvider>
          </Card>
        </main>
      </div>
    </div>
  );
}
