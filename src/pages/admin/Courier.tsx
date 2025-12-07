import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Eye, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { getCourierOrders, updateCourierStatus } from "@/services/courierService";

interface Order {
  id: string;
  fullName: string;
  address: string;
  mobile: string;
  product: string;
  quantity: string;
  status: string;
  createdAt: string;
}

const Courier = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const token = localStorage.getItem("adminAuthToken") || "";

  // Load courier orders from API
  const loadOrders = async () => {
    try {
      const data = await getCourierOrders(token);
      // Ensure data is an array
      const ordersArray = Array.isArray(data) ? data : [];
      setOrders(ordersArray);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch courier orders",
        variant: "destructive",
      });
      setOrders([]);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // Filter and search
  useEffect(() => {
    let filtered = orders;

    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.mobile.includes(searchTerm)
      );
    }

    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await updateCourierStatus(orderId, newStatus, token);
      setOrders((prev) =>
        prev.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order))
      );
      toast({
        title: "Status Updated",
        description: `Courier status changed to "${newStatus}"`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update courier status",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "outline" | "destructive" | "yellow" | "green"> = {
      "sended": "green",
      "in-transit": "default",
      "delivered": "outline",
    };
    const labels: Record<string, string> = {
      "sended": "Updated",
      "in-transit": "In Transit",
      "delivered": "Delivered",
    };
    return <Badge variant={variants[status] || "default"}>{labels[status] || status}</Badge>;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold">Courier Management</h1>
          <p className="text-muted-foreground mt-2">Track and manage delivery orders</p>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search by name or mobile..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 rounded-2xl"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="rounded-2xl">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="sended">Updated</SelectItem>
                  <SelectItem value="in-transit">In Transit</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Courier Orders Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="py-4 text-left">Customer</TableHead>
                    <TableHead className="py-4 text-center">Address</TableHead>
                    <TableHead className="py-4 text-center">Mobile</TableHead>
                    <TableHead className="py-4 text-center">Product</TableHead>
                    <TableHead className="py-4 text-center">Quantity</TableHead>
                    <TableHead className="py-4 text-center">Status</TableHead>
                    <TableHead className="py-4 text-center">Date</TableHead>
                    <TableHead className="py-4 text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium py-4">{order.fullName}</TableCell>
                      <TableCell className="py-4 text-center max-w-xs truncate">{order.address}</TableCell>
                      <TableCell className="py-4 text-center">{order.mobile}</TableCell>
                      <TableCell className="py-4 text-center">{order.product}</TableCell>
                      <TableCell className="py-4 text-center">{order.quantity}</TableCell>
                      <TableCell className="py-4 text-center">{getStatusBadge(order.status)}</TableCell>
                      <TableCell className="py-4 text-center">{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center justify-center gap-3">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => navigate(`/admin/orders/${order.id}`)}
                            className="h-9 w-9"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {order.status !== "delivered" && (
                            <Button
                              className="bg-primary hover:bg-primary/90 h-9 w-9"
                              size="icon"
                              onClick={() =>
                                handleStatusChange(
                                  order.id,
                                  order.status === "sended" ? "in-transit" : "delivered"
                                )
                              }
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filteredOrders.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  No courier orders found
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Courier;
