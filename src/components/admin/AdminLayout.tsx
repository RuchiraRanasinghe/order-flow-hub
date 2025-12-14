import { ReactNode, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { NavLink } from "@/components/NavLink";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  Truck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import logo from "@/assets/logo.png";

// import { useState } from "react";

interface AdminLayoutProps {
  children: ReactNode;
}

const adminMenuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin/dashboard" },
  { icon: ShoppingCart, label: "Orders", path: "/admin/orders" },
  { icon: Truck, label: "Courier", path: "/admin/courier", showBadge: true },
  { icon: Package, label: "Products", path: "/admin/products" },
  { icon: BarChart3, label: "Analytics", path: "/admin/analytics" },
  { icon: Settings, label: "Settings", path: "/admin/settings" },
];
const courierMenuItems = [
  { icon: Truck, label: "Courier", path: "/admin/courier", showBadge: false },
];

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [courierCount, setCourierCount] = useState(0);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    // Check for JWT tokens
    const adminToken = localStorage.getItem("adminAuthToken");
    const courierToken = localStorage.getItem("courierAuthToken");
    let userRole = null;
    if (adminToken) {
      userRole = "admin";
    } else if (courierToken) {
      userRole = "courier";
    }
    setRole(userRole);

    // Route protection
    if (!userRole) {
      // Not logged in
      if (location.pathname.startsWith("/admin/courier")) {
        navigate("/admin/courier-login");
      } else {
        navigate("/admin/login");
      }
    } else if (userRole === "courier") {
      // Courier can only access /admin/courier
      if (!location.pathname.startsWith("/admin/courier")) {
        navigate("/admin/courier");
      }
    }

    // Calculate courier orders count (for admin only)
    const updateCourierCount = () => {
      const orders = JSON.parse(localStorage.getItem("orders") || "[]");
      const count = orders.filter((o: any) => o.status === "sended").length;
      setCourierCount(count);
    };
    if (userRole === "admin") updateCourierCount();
    window.addEventListener("storage", updateCourierCount);
    return () => window.removeEventListener("storage", updateCourierCount);
  }, [navigate, location]);

  const handleLogout = () => {
    localStorage.removeItem("adminAuthToken");
    localStorage.removeItem("courierAuthToken");
    setRole(null);
    if (role === "courier") {
      navigate("/admin/courier-login");
    } else {
      navigate("/admin/login");
    }
  };

  const Sidebar = () => (
    <div className="h-full flex flex-col bg-card border-r">
      <div className="p-6 border-b">
        <img src={logo} alt="Logo" className="h-16 w-auto mx-auto" />
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {(role === "admin" ? adminMenuItems : courierMenuItems).map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
            activeClassName="bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
            {item.showBadge && courierCount > 0 && (
              <Badge className="ml-auto">{courierCount}</Badge>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t">
        <Button
          variant="outline"
          className="w-full justify-start gap-3 rounded-xl"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
  <div className="min-h-screen bg-background flex w-full overflow-x-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 fixed h-screen">
        <Sidebar />
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        {/* Mobile Header */}
        <header className="lg:hidden bg-card border-b p-4 flex items-center justify-between sticky top-0 z-40">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <Sidebar />
            </SheetContent>
          </Sheet>
          
          <img src={logo} alt="Logo" className="h-10 w-auto" />
          
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="w-5 h-5" />
          </Button>
        </header>

        {/* Page Content */}
        <main className="p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
