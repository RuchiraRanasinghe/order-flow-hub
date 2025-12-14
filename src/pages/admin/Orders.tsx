// src/pages/admin/Orders.tsx
import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button"; // Added missing Button import
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, ArrowRight, Eye, Trash2, Send, Undo2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getOrders, updateOrderStatus, deleteOrder } from "@/services/orderService";
import { useNavigate } from "react-router-dom";
import ConfirmModal from "@/components/modals/ConfirmModal";
import Pagination from '@/components/ui/paginations';

interface Order {
  id: string;
  fullName: string;
  mobile: string;
  product: string;
  quantity: number;
  status: string;
  createdAt: string;
}

const Orders = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Load orders from API
  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await getOrders({ page, limit, status: statusFilter !== 'all' ? statusFilter : undefined, search: searchTerm || undefined });
      console.log("Orders API response:", response);

      // Response may be { orders, total, page, limit } or array
      if (response && response.data === undefined && Array.isArray(response)) {
        // request() sometimes unwraps and returns array directly
        setOrders(response);
        setTotal(response.length || 0);
      } else if (response && Array.isArray(response)) {
        setOrders(response);
        setTotal(response.length || 0);
      } else if (response && response.orders) {
        setOrders(response.orders);
        setTotal(response.total || 0);
      } else if (response && Array.isArray(response.data)) {
        setOrders(response.data);
        setTotal(response.count || response.data.length || 0);
      } else if (response && response.data) {
        // when request() unwraps and returns response.data
        // data may be orders array or paginated object
        if (Array.isArray(response.data)) {
          setOrders(response.data);
          setTotal(response.count || response.data.length || 0);
        } else if (response.data.orders) {
          setOrders(response.data.orders);
          setTotal(response.data.total || 0);
        }
      }
      
    } catch (error: any) {
      console.error("Error loading orders:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch orders",
        variant: "destructive",
      });
      setOrders([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Reset to first page when component mounts
    setPage(1);
    loadOrders();
  }, []);

  // Reload when page/limit/search/status changes
  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, statusFilter, searchTerm]);

  // Reset to first page when search or status filter changes
  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusFilter]);

  // Filter orders based on search & status
  useEffect(() => {
    // When using server-side pagination & filters, orders already reflect search/status
    setFilteredOrders(Array.isArray(orders) ? orders : []);
  }, [orders, searchTerm, statusFilter]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
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

  const handleSendToCourier = (orderId: string) =>
    handleStatusChange(orderId, "sended");

  const handleUnsendOrder = (orderId: string) =>
    handleStatusChange(orderId, "received");

  const handleDelete = (orderId: string) => {
    setOrderToDelete(orderId);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!orderToDelete) return;
    setDeleting(true);
    try {
      await deleteOrder(orderToDelete);
      // Reload current page after deletion to keep pagination accurate
      await loadOrders();
      toast({
        title: 'Order Deleted',
        description: 'The order was deleted successfully.'
      });
    } catch (error: any) {
      console.error('Delete order error:', error);
      toast({
        title: 'Error',
        description: error?.message || 'Failed to delete order',
        variant: 'destructive'
      });
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
      setOrderToDelete(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline" | "yellow" | "green"> =
      {
        received: "yellow",
        issued: "default",
        "sended": "green",
        "in-transit": "outline",
        "delivered": "default",
      };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading orders...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
  <div className="space-y-6 pb-28"> {/* add bottom padding to prevent overlap with fixed pagination */}
        <div>
          <h1 className="text-4xl font-bold">Orders Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage and track all customer orders
          </p>
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
                  <SelectItem value="received">Received</SelectItem>
                  <SelectItem value="sended">Sended</SelectItem>
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
                    <TableHead className="py-4 text-left">Customer</TableHead>
                    <TableHead className="py-4 text-center">Mobile</TableHead>
                    <TableHead className="py-4 text-center">Product</TableHead>
                    <TableHead className="py-4 text-center">Quantity</TableHead>
                    <TableHead className="py-4 text-center">Status</TableHead>
                    <TableHead className="py-4 text-center">Date</TableHead>
                    <TableHead className="py-4 text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.isArray(filteredOrders) && filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium py-4">{order.fullName}</TableCell>
                        <TableCell className="py-4 text-center">{order.mobile || 'N/A'}</TableCell>
                        <TableCell className="py-4 text-center">{order.product || 'N/A'}</TableCell>
                        <TableCell className="py-4 text-center">{order.quantity || 0}</TableCell>
                        <TableCell className="py-4 text-center">{getStatusBadge(order.status || 'received')}</TableCell>
                        <TableCell className="py-4 text-center">
                          {order.createdAt ? 
                            new Date(order.createdAt).toLocaleDateString() : 
                            'N/A'}
                        </TableCell>
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
                            {order.status === "sended" || 
                             order.status === "in-transit" || 
                             order.status === "delivered" ? (
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleUnsendOrder(order.id)}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-600 border-gray-300 h-9 w-9"
                                title="Unsend Order"
                              >
                                <Undo2 className="w-4 h-4" />
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleSendToCourier(order.id)}
                                className="bg-white hover:bg-gray-50 text-gray-700 border-gray-300 h-9 w-9"
                                title="Send to Courier"
                              >
                                <Send className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => handleDelete(order.id)}
                              className="h-9 w-9"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                        {loading ? 'Loading orders...' : 'No orders found'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
  <div className="mt-4">
  <Pagination
        
          total={total}
          page={page}
          limit={limit}
          onPageChange={(p) => setPage(p)}
          onLimitChange={(l) => { setLimit(l); setPage(1); }}
          limits={[5,10,15,20]}
          fixed={false} // embedded, right-aligned pagination

        /></div>
      </div>
      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => { setConfirmOpen(false); setOrderToDelete(null); }}
        onConfirm={confirmDelete}
        title="Delete Order"
        description="Are you sure you want to delete this order? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        loading={deleting}
      />
    </AdminLayout>
  );
};

export default Orders;