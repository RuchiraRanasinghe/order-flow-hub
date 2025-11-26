import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart,
  Clock,
  CheckCircle,
  TrendingUp,
  Calendar,
  Truck,
} from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { getOrders } from "@/services/orderService";

interface Order {
  id: string;
  fullName: string;
  mobile: string;
  product: string;
  quantity: string;
  status: string;
  createdAt: string;
}

const Dashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    received: 0,
    issued: 0,
    courier: 0,
    today: 0,
    monthly: 0,
  });

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("adminAuthToken") || ""; // use a token if required
        const response = await getOrders(token);
        setOrders(response);

        // Calculate stats
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        const newStats = {
          total: response.length,
          pending: response.filter((o: Order) => o.status === "pending").length,
          received: response.filter((o: Order) => o.status === "received").length,
          issued: response.filter((o: Order) => o.status === "issued").length,
          courier: response.filter((o: Order) => o.status === "sent-to-courier" || o.status === "in-transit").length,
          today: response.filter((o: Order) => new Date(o.createdAt) >= todayStart).length,
          monthly: response.filter((o: Order) => new Date(o.createdAt) >= monthStart).length,
        };

        setStats(newStats);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      }
    };

    fetchOrders();
  }, []);

  const statusData = [
    { name: "Pending", value: stats.pending },
    { name: "Received", value: stats.received },
    { name: "Issued", value: stats.issued },
  ];

  const dailyData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dateStr = date.toISOString().split("T")[0];
    const count = orders.filter((o) => o.createdAt.startsWith(dateStr)).length;
    return { name: date.toLocaleDateString("en-US", { weekday: "short" }), orders: count };
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      pending: "secondary",
      received: "default",
      issued: "default",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-2">Welcome back! Here's your overview.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="w-5 h-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
              <Clock className="w-5 h-5 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-warning">{stats.pending}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Received Orders</CardTitle>
              <CheckCircle className="w-5 h-5 text-info" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-info">{stats.received}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Issued Orders</CardTitle>
              <CheckCircle className="w-5 h-5 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-success">{stats.issued}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Courier Orders</CardTitle>
              <Truck className="w-5 h-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{stats.courier}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Today's Orders</CardTitle>
              <Calendar className="w-5 h-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.today}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Monthly Orders</CardTitle>
              <TrendingUp className="w-5 h-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.monthly}</div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Orders by Status</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={statusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Orders (Last 7 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="orders" stroke="hsl(var(--primary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orders.slice(-5).reverse().map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 bg-muted rounded-xl">
                  <div className="flex-1">
                    <p className="font-semibold">{order.fullName}</p>
                    <p className="text-sm text-muted-foreground">{order.mobile}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">Qty: {order.quantity}</p>
                  </div>
                  <div>{getStatusBadge(order.status)}</div>
                </div>
              ))}
              {orders.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No orders yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
