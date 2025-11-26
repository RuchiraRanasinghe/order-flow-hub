import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Eye, Trash2, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { getOrders, updateOrderStatus } from "@/services/orderService";

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

const Orders = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const token = localStorage.getItem("adminAuthToken") || "";

  // Load orders from API
  const loadOrders = async () => {
    try {
      const data = await getOrders(token);
      setOrders(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch orders",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // Filter orders based on search and status
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
      await updateOrderStatus(orderId, newStatus, token);
      setOrders((prev) =>
        prev.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order))
      );
      toast({
        title: "Status Updated",
        description: `Order status changed to "${newStatus}"`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update order status",
        variant: "destructive",
      });
    }
  };

  const handleSendToCourier = (orderId: string) => handleStatusChange(orderId, "sent-to-courier");

  const handleDelete = (orderId: string) => {
    toast({
      title: "Action Not Allowed",
      description: "Deleting orders is disabled in production.",
      variant: "destructive",
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "primary"> = {
      pending: "secondary",
      received: "default",
      issued: "default",
      "sent-to-courier": "primary",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold">Orders Management</h1>
          <p className="text-muted-foreground mt-2">Manage and track all customer orders</p>
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
                  <SelectItem value="all">All Orders</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="received">Received</SelectItem>
                  <SelectItem value="issued">Issued</SelectItem>
                  <SelectItem value="sent-to-courier">Sent to Courier</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Mobile</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.fullName}</TableCell>
                      <TableCell>{order.mobile}</TableCell>
                      <TableCell>{order.product}</TableCell>
                      <TableCell>{order.quantity}</TableCell>
                      <TableCell>
                        <Select
                          value={order.status}
                          onValueChange={(value) => handleStatusChange(order.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="received">Received</SelectItem>
                            <SelectItem value="issued">Issued</SelectItem>
                            <SelectItem value="sent-to-courier">Sent to Courier</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => navigate(`/admin/orders/${order.id}`)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {order.status !== "sent-to-courier" && (
                            <Button
                              className="bg-primary hover:bg-primary/90"
                              size="icon"
                              onClick={() => handleSendToCourier(order.id)}
                            >
                              <ArrowRight className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => handleDelete(order.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filteredOrders.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">No orders found</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Orders;
