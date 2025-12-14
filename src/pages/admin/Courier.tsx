import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Eye, CheckCircle, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { getCourierOrders, updateCourierStatus } from "@/services/courierService";
import { InvoiceModal } from "@/components/modals/InvoiceModal";
import { ExportCourierModal } from "@/components/modals/ExportCourierModal";
import Pagination from '@/components/ui/paginations';

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

const Courier = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(5);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const token = localStorage.getItem("adminAuthToken") || "";

  // Load courier orders from API
  const loadOrders = async () => {
    try {
      const response = await getCourierOrders({ page, limit, status: statusFilter !== 'all' ? statusFilter : undefined, search: searchTerm || undefined }, token);

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

  const downloadOrderDetails = (order: Order) => {
    // Generate PDF-like content
  const content = `
=====================================
        COURIER ORDER INVOICE
=====================================

Order Details
-------------
Invoice Number: INV-${String(order.id).slice(0, 8).toUpperCase()}
Order Number: #${String(order.id).slice(0, 8).toUpperCase()}
Date: ${new Date(order.createdAt).toLocaleDateString()}
Status: ${order.status.toUpperCase()}

Customer Information
--------------------
Name: ${order.fullName}
Mobile: ${order.mobile}
Email: ${order.email || 'N/A'}
Address: ${order.address}

Courier Details
---------------
Company: ${order.courierCompany || 'Express Delivery'}
Tracking: ${order.trackingNumber || 'TRK-' + String(order.id).slice(0, 10).toUpperCase()}
Method: Standard Delivery

Order Items
-----------
Product: ${order.product}
Quantity: ${order.quantity}
Unit Price: Rs. ${(order.price || 1500).toLocaleString()}
Subtotal: Rs. ${((order.price || 1500) * parseInt(order.quantity)).toLocaleString()}

Payment Summary
---------------
Subtotal: Rs. ${((order.price || 1500) * parseInt(order.quantity)).toLocaleString()}
Delivery: Rs. ${(order.deliveryCharge || 200).toLocaleString()}
${order.discount ? `Discount: -Rs. ${order.discount.toLocaleString()}` : ''}
-------------------------------------
TOTAL: Rs. ${((order.price || 1500) * parseInt(order.quantity) + (order.deliveryCharge || 200) - (order.discount || 0)).toLocaleString()}

Payment Method: Cash on Delivery (COD)

=====================================
Thank you for your business!
=====================================
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
  a.download = `invoice-${String(order.id).slice(0, 8)}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Downloaded",
      description: "Invoice downloaded successfully",
    });
  };

  const handleExportSelected = (selectedOrders: Order[]) => {
  const content = selectedOrders.map((order, index) => `
=====================================
    COURIER ORDER ${index + 1} OF ${selectedOrders.length}
=====================================

Order Number: #${String(order.id).slice(0, 8).toUpperCase()}
Date: ${new Date(order.createdAt).toLocaleDateString()}
Status: ${order.status.toUpperCase()}

Customer: ${order.fullName}
Mobile: ${order.mobile}
Address: ${order.address}

Product: ${order.product}
Quantity: ${order.quantity}
Total: Rs. ${((order.price || 1500) * parseInt(order.quantity) + (order.deliveryCharge || 200) - (order.discount || 0)).toLocaleString()}

Courier: ${order.courierCompany || 'Express Delivery'}
Tracking: ${order.trackingNumber || 'TRK-' + String(order.id).slice(0, 10).toUpperCase()}
    `).join('\n\n');

    const header = `
=====================================
   COURIER ORDERS EXPORT REPORT
=====================================
Export Date: ${new Date().toLocaleDateString()}
Total Orders: ${selectedOrders.length}
=====================================

`;

    const fullContent = header + content;

    const blob = new Blob([fullContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `courier-orders-${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Exported Successfully",
      description: `${selectedOrders.length} courier order(s) exported as PDF`,
    });
  };

  const openExportModal = () => {
    if (filteredOrders.length === 0) {
      toast({
        title: "No Orders",
        description: "No orders available to export",
        variant: "destructive",
      });
      return;
    }
    setIsExportModalOpen(true);
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
            <h1 className="text-4xl font-bold">Courier Management</h1>
            <p className="text-muted-foreground mt-2">Track and manage delivery orders</p>
          </div>
          <Button
            onClick={openExportModal}
            className="bg-primary hover:bg-primary/90"
            disabled={filteredOrders.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Export as PDF
          </Button>
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
                            onClick={() => openInvoiceModal(order)}
                            className="h-9 w-9"
                            title="View Invoice"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => downloadOrderDetails(order)}
                            className="h-9 w-9"
                            title="Download Order"
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
        {/* Pagination for courier orders */}
        <Pagination
          total={total}
          page={page}
          limit={limit}
          onPageChange={(p) => setPage(p)}
          onLimitChange={(l) => { setLimit(l); setPage(1); }}
            limits={[5,10,15,20]}
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

      {/* Export Courier Modal */}
      <ExportCourierModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        orders={filteredOrders}
        onExport={handleExportSelected}
      />
    </AdminLayout>
  );
};

export default Courier;
