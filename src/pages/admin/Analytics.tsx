import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import request from "@/services/api";

interface Order {
  id: string;
  createdAt: string;
  status: string;
  quantity: string;
}

const Analytics = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  // Load orders from API
  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await request("orders", { method: "GET" });
      // Ensure data is an array
      const ordersArray = Array.isArray(data) ? data : [];
      setOrders(ordersArray);
    } catch (error: any) {
      console.error("Failed to load orders:", error.message || error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // Prepare data for charts
  const statusData = [
    {
      name: "Pending",
      value: orders.filter((o) => o.status === "pending").length,
      color: "hsl(var(--warning))",
    },
    {
      name: "Received",
      value: orders.filter((o) => o.status === "received").length,
      color: "hsl(var(--info))",
    },
    {
      name: "Issued",
      value: orders.filter((o) => o.status === "issued").length,
      color: "hsl(var(--success))",
    },
    {
      name: "Sent to Courier",
      value: orders.filter((o) => o.status === "sent-to-courier").length,
      color: "hsl(var(--secondary))",
    },
    {
      name: "Delivered",
      value: orders.filter((o) => o.status === "delivered").length,
      color: "hsl(var(--success))",
    },
  ];

  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dateStr = date.toISOString().split("T")[0];
    const dayOrders = orders.filter((o) => o.createdAt.startsWith(dateStr));
    return {
      name: date.toLocaleDateString("en-US", { weekday: "short" }),
      orders: dayOrders.length,
      revenue: dayOrders.reduce((sum, o) => sum + parseInt(o.quantity) * 10000, 0),
    };
  });

  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - i));
    const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const monthOrders = orders.filter((o) => o.createdAt.startsWith(monthStr));
    return {
      name: date.toLocaleDateString("en-US", { month: "short" }),
      orders: monthOrders.length,
      revenue: monthOrders.reduce((sum, o) => sum + parseInt(o.quantity) * 10000, 0),
    };
  });

  const totalRevenue = orders.reduce((sum, o) => sum + parseInt(o.quantity) * 10000, 0);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold">Analytics</h1>
          <p className="text-muted-foreground mt-2">Track your business performance</p>
        </div>

        {/* Revenue Card */}
        <Card>
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary">
              Rs. {totalRevenue.toLocaleString()}
            </div>
            <p className="text-muted-foreground mt-2">From {orders.length} orders</p>
          </CardContent>
        </Card>

        {/* Charts Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Weekly Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="orders" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Weekly Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Trends (Last 6 Months)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="orders" stroke="hsl(var(--primary))" strokeWidth={2} />
                  <Line type="monotone" dataKey="revenue" stroke="hsl(var(--success))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Analytics;
