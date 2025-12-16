import { useEffect, useState } from "react";
import CourierLayout from "@/components/courier/CourierLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Eye, CheckCircle, Download, Truck, Package, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getCourierOrders, updateCourierStatus } from "@/services/courierService";
import { InvoiceModal } from "@/components/modals/InvoiceModal";
import Pagination from '@/components/ui/paginations';
import AdminLayout from "@/components/admin/AdminLayout";

interface Order {
  id: string;
  fullName: string;
  address: string;
  mobile: string;
  product: string;
  quantity: string;
  status: string;
  createdAt: string;
  email?: string;
  price?: number;
  deliveryCharge?: number;
  discount?: number;
  courierCompany?: string;
  trackingNumber?: string;
}

interface Stats {
  pending: number;
  inTransit: number;
  delivered: number;
  total: number;
}

const CourierDashboard = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [stats, setStats] = useState<Stats>({
    pending: 0,
    inTransit: 0,
    delivered: 0,
    total: 0,
  });

  const token = localStorage.getItem("courierAuthToken") || "";

  // Load courier orders from API
  const loadOrders = async () => {
    try {
      const response = await getCourierOrders(
        { 
          page, 
          limit, 
          status: statusFilter !== 'all' ? statusFilter : undefined, 
          search: searchTerm || undefined 
        }, 
        token
      );

      if (response && response.data && response.data.orders) {
        setOrders(response.data.orders as Order[]);
        setTotal(response.data.total || 0);
      } else if (Array.isArray(response)) {
        setOrders(response);
        setTotal(response.length);
      } else if (response && response.orders) {
        setOrders(response.orders);
        setTotal(response.total || 0);
      } else {
        setOrders([]);
        setTotal(0);
      }
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

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, statusFilter, searchTerm]);

  // Calculate stats
  useEffect(() => {
    const newStats: Stats = {
      pending: orders.filter(o => o.status === "sended").length,
      inTransit: orders.filter(o => o.status === "in-transit").length,
      delivered: orders.filter(o => o.status === "delivered").length,
      total: orders.length,
    };
    setStats(newStats);
  }, [orders]);

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
          order.mobile.includes(searchTerm) ||
          order.address.toLowerCase().includes(searchTerm.toLowerCase())
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
        description: `Delivery status changed to ${newStatus}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update delivery status",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "outline" | "destructive" | "yellow" | "green"> = {
      "sended": "yellow",
      "in-transit": "default",
      "delivered": "green",
    };
    const labels: Record<string, string> = {
      "sended": "Returned Orders",
      "in-transit": "In Transit",
      "delivered": "Delivered",
    };
    return <Badge variant={variants[status] || "default"}>{labels[status] || status}</Badge>;
  };

  const downloadOrderDetails = (order: Order) => {
    const content = `
=====================================
        DELIVERY ORDER DETAILS
=====================================

Order Information
-----------------
Order Number: #${String(order.id).slice(0, 8).toUpperCase()}
Date: ${new Date(order.createdAt).toLocaleDateString()}
Status: ${order.status.toUpperCase()}

Customer Information
--------------------
Name: ${order.fullName}
Mobile: ${order.mobile}
Email: ${order.email || 'N/A'}
Address: ${order.address}

Delivery Details
----------------
Company: ${order.courierCompany || 'Express Delivery'}
Tracking: ${order.trackingNumber || 'TRK-' + String(order.id).slice(0, 10).toUpperCase()}

Package Information
-------------------
Product: ${order.product}
Quantity: ${order.quantity}
Weight: Standard

=====================================
      Thank you for delivering!
=====================================
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `delivery-${String(order.id).slice(0, 8)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Downloaded",
      description: "Delivery details downloaded successfully",
    });
  };

  const openInvoiceModal = (order: Order) => {
    setSelectedOrder(order);
    setIsInvoiceModalOpen(true);
  };

  return (
    <AdminLayout>
      <div className="space-y-6 pb-28">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">My Deliveries</h1>
            <p className="text-muted-foreground mt-2">Manage your delivery orders</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Returned Orders
              </CardTitle>
              <Clock className="w-4 h-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                In Transit
              </CardTitle>
              <Truck className="w-4 h-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inTransit}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Delivered
              </CardTitle>
              <CheckCircle className="w-4 h-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.delivered}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Orders
              </CardTitle>
              <Package className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Search & Filter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search by name, mobile, or address..."
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
                  <SelectItem value="sended"> Returned Orders</SelectItem>
                  <SelectItem value="in-transit">In Transit</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Orders Table */}
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
                      <TableCell className="py-4 text-center max-w-xs truncate" title={order.address}>
                        {order.address}
                      </TableCell>
                      <TableCell className="py-4 text-center">{order.mobile}</TableCell>
                      <TableCell className="py-4 text-center">{order.product}</TableCell>
                      <TableCell className="py-4 text-center">{order.quantity}</TableCell>
                      <TableCell className="py-4 text-center">{getStatusBadge(order.status)}</TableCell>
                      <TableCell className="py-4 text-center">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center justify-center gap-3">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => openInvoiceModal(order)}
                            className="h-9 w-9"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => downloadOrderDetails(order)}
                            className="h-9 w-9"
                            title="Download Details"
                          >
                            <Download className="w-4 h-4" />
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
                              title="Update Status"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredOrders.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                        No delivery orders found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Pagination */}
        <Pagination
          total={total}
          page={page}
          limit={limit}
          onPageChange={(p) => setPage(p)}
          onLimitChange={(l) => { setLimit(l); setPage(1); }}
          limits={[10, 20, 30, 50]}
          fixed={false}
        />
      </div>

      {/* Invoice Modal */}
      <InvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        order={selectedOrder}
        onDownload={downloadOrderDetails}
      />
    </AdminLayout>
  );
};

export default CourierDashboard;