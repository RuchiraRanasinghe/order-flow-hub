import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Phone, Package, Calendar, CheckCircle, Truck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getOrderById, updateOrderStatus } from "@/services/orderService";

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

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("adminAuthToken") || "";

  // Fetch order from API
  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await getOrderById(id, token);
        setOrder(data);
      } catch (error: any) {
        console.error("Error fetching order:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to fetch order details",
          variant: "destructive",
        });
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  const handleSendToCourier = async () => {
    if (!order) return;
    
    try {
      await updateOrderStatus(order.id, "sended", token);
      setOrder({ ...order, status: "sended" });
      
      toast({
        title: "Sent to Courier",
        description: "Order has been sent to courier successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update order status",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading order details...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!order) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Order not found</p>
          <Button className="mt-4" onClick={() => navigate("/admin/orders")}>
            Back to Orders
          </Button>
        </div>
      </AdminLayout>
    );
  }

  const timeline = [
    { status: "received", label: "Order Placed", date: order.createdAt },
    {
      status: "received",
      label: "Order Received",
      date: order.status === "received" || order.status === "issued" ? order.createdAt : null,
    },
    {
      status: "issued",
      label: "Order Issued",
      date: order.status === "issued" ? order.createdAt : null,
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/admin/orders")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-4xl font-bold">Order Details</h1>
            <p className="text-muted-foreground mt-1">Order ID: {order.id}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Order Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{order.fullName}</p>
                    <p className="text-sm text-muted-foreground">{order.mobile}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">Delivery Address</p>
                    <p className="text-sm text-muted-foreground">{order.address}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Package className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">Herbal Cream</p>
                      <p className="text-sm text-muted-foreground">මීයා රෝගීන්</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">Qty: {order.quantity}</p>
                    <p className="text-sm text-muted-foreground">
                      Rs. {(parseInt(order.quantity) * 10000).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Order Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {timeline.map((item, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          item.date
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {item.date && <CheckCircle className="w-5 h-5" />}
                        {!item.date && <div className="w-3 h-3 rounded-full bg-current" />}
                      </div>
                      <div className="flex-1 pb-4 border-l-2 border-muted pl-4 ml-5 -mt-2">
                        <p className="font-semibold">{item.label}</p>
                        {item.date && (
                          <p className="text-sm text-muted-foreground">
                            {new Date(item.date).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge>{order.status}</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Order Date</span>
                  <span className="font-medium">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Quantity</span>
                  <span className="font-medium">{order.quantity}</span>
                </div>

                <div className="border-t pt-4 mt-4">
                  <div className="flex items-center justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>Rs. {(parseInt(order.quantity) * 10000).toLocaleString()}</span>
                  </div>
                </div>

{order.status !== "sended" && order.status !== "in-transit" && order.status !== "delivered" && (
                  <Button
                    className="w-full rounded-2xl mb-3 bg-primary hover:bg-primary/90"
                    onClick={handleSendToCourier}
                  >
                    <Truck className="w-4 h-4 mr-2" />
                    Send to Courier
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  className="w-full rounded-2xl"
                  onClick={() => {
                    const message = `නව ඇණවුමක්!\n\nනම: ${order.fullName}\nදුරකථන: ${order.mobile}\nලිපිනය: ${order.address}\nප්‍රමාණය: ${order.quantity}`;
                    window.open(`https://wa.me/94701617462?text=${encodeURIComponent(message)}`, "_blank");
                  }}
                >
                  Send to WhatsApp
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default OrderDetails;
