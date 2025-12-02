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
      const response = await getCourierOrders(token);
      
      // Extract orders array from response
      let ordersData: Order[] = [];
      
      if (Array.isArray(response)) {
        ordersData = response;
      } else if (response && Array.isArray(response.data)) {
        ordersData = response.data;
      }
      
      setOrders(ordersData);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch courier orders",
        variant: "destructive",
      });
      setOrders([]); // Set empty array on error
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // Filter and search
  useEffect(() => {
    if (!Array.isArray(orders)) {
      setFilteredOrders([]);
      return;
    }

    let filtered = [...orders];

    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (order.mobile && order.mobile.includes(searchTerm))
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
    const variants: Record<string, "default" | "secondary" | "primary"> = {
      "sent-to-courier": "secondary",
      "in-transit": "default",
      "delivered": "primary",
    };
    const labels: Record<string, string> = {
      "sent-to-courier": "Sent to Courier",
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
                  <SelectItem value="sent-to-courier">Sent to Courier</SelectItem>
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
                    <TableHead>Customer</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Mobile</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.isArray(filteredOrders) && filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.fullName}</TableCell>
                        <TableCell className="max-w-xs truncate">{order.address || 'N/A'}</TableCell>
                        <TableCell>{order.mobile || 'N/A'}</TableCell>
                        <TableCell>{order.product || 'N/A'}</TableCell>
                        <TableCell>{order.quantity || 0}</TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell>
                          {order.createdAt ? 
                            new Date(order.createdAt).toLocaleDateString() : 
                            'N/A'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => navigate(`/admin/orders/${order.id}`)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {order.status !== "delivered" && (
                              <Button
                                className="bg-primary hover:bg-primary/90"
                                size="icon"
                                onClick={() =>
                                  handleStatusChange(
                                    order.id,
                                    order.status === "sent-to-courier" ? "in-transit" : "delivered"
                                  )
                                }
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                        No courier orders found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Courier;
