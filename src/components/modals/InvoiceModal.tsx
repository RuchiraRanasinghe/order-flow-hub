import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import logo from "@/assets/logo.png";
import productAd from "@/assets/product-ad.jpg";

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

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onDownload: (order: Order) => void;
}

export const InvoiceModal = ({ isOpen, onClose, order, onDownload }: InvoiceModalProps) => {
  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[95vh] overflow-hidden p-0">
        <div className="overflow-y-auto max-h-[95vh]">
          {/* Header Cover Banner */}
          <div className="relative h-32">
            <img 
              src={productAd} 
              alt="Header Cover" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/40 flex items-center justify-between px-8">
              <div className="flex items-center gap-4">
                <div className="bg-white p-2 rounded-lg shadow-lg">
                  <img src={logo} alt="Company Logo" className="h-12 w-auto" />
                </div>
                <div className="text-white">
                  <h2 className="text-3xl font-bold">INVOICE</h2>
                  <p className="text-sm opacity-90">Order Management System</p>
                </div>
              </div>
            </div>
          </div>

          {/* Invoice Content */}
          <div className="p-8 space-y-6 bg-white">
            {/* Invoice Header Info */}
            <div className="grid grid-cols-2 gap-6 pb-6 border-b border-green-100">
              <div>
                <h3 className="text-sm font-semibold text-green-700 mb-3">INVOICE DETAILS</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Invoice Number:</span>
                    <span className="font-semibold">INV-{order.id.slice(0, 8)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Number:</span>
                    <span className="font-semibold">#{order.id.slice(0, 8)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Invoice Date:</span>
                    <span className="font-semibold">{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="font-semibold text-green-600">Cash on Delivery</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-green-700 mb-3">ORDER STATUS</h3>
                <div className="space-y-2">
                  <Badge 
                    className="text-sm px-4 py-1 bg-green-100 text-green-700 border-green-200" 
                    variant="outline"
                  >
                    {order.status.toUpperCase()}
                  </Badge>
                  <div className="text-xs text-gray-500 mt-2">
                    Last updated: {new Date().toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Customer & Delivery Details */}
            <div className="grid md:grid-cols-2 gap-6 pb-6 border-b border-green-100">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <span className="w-1 h-4 bg-green-600 rounded"></span>
                  CUSTOMER DETAILS
                </h3>
                <div className="space-y-2 text-sm bg-green-50 p-4 rounded-lg border border-green-100">
                  <div>
                    <p className="text-gray-500 text-xs">Customer Name</p>
                    <p className="font-semibold text-gray-900">{order.fullName}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Phone Number</p>
                    <p className="font-semibold text-gray-900">{order.mobile}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Email</p>
                    <p className="font-semibold text-gray-900">{order.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Delivery Address</p>
                    <p className="font-semibold text-gray-900">{order.address}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <span className="w-1 h-4 bg-green-600 rounded"></span>
                  COURIER DETAILS
                </h3>
                <div className="space-y-2 text-sm bg-green-50 p-4 rounded-lg border border-green-100">
                  <div>
                    <p className="text-gray-500 text-xs">Courier Company</p>
                    <p className="font-semibold text-gray-900">{order.courierCompany || 'Express Delivery'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Tracking Number</p>
                    <p className="font-semibold text-gray-900">{order.trackingNumber || 'TRK-' + order.id.slice(0, 10)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Delivery Method</p>
                    <p className="font-semibold text-gray-900">Standard Delivery</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">COD Amount</p>
                    <p className="font-semibold text-green-600">Rs. {((order.price || 1500) * parseInt(order.quantity)).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items Table */}
            <div className="pb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <span className="w-1 h-4 bg-green-600 rounded"></span>
                ORDER ITEMS
              </h3>
              <div className="border border-green-100 rounded-lg overflow-hidden shadow-sm">
                <table className="w-full">
                  <thead className="bg-green-50 border-b border-green-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-green-700">PRODUCT</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-green-700">QTY</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-green-700">UNIT PRICE</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-green-700">TOTAL</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b hover:bg-green-50">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border border-green-100">
                            <img src={productAd} alt="Product" className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-gray-900">{order.product}</p>
                            <p className="text-xs text-gray-500">SKU: PRD-{order.id.slice(0, 6)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center font-semibold text-gray-900">{order.quantity}</td>
                      <td className="px-4 py-4 text-right text-gray-900">Rs. {(order.price || 1500).toLocaleString()}</td>
                      <td className="px-4 py-4 text-right font-semibold text-green-600">
                        Rs. {((order.price || 1500) * parseInt(order.quantity)).toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals Section */}
            <div className="flex justify-end pb-6 border-b border-green-100">
              <div className="w-80 space-y-3 bg-green-50 p-4 rounded-lg border border-green-100">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-semibold">Rs. {((order.price || 1500) * parseInt(order.quantity)).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery Charge:</span>
                  <span className="font-semibold">Rs. {(order.deliveryCharge || 200).toLocaleString()}</span>
                </div>
                {order.discount && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount:</span>
                    <span className="font-semibold">- Rs. {order.discount.toLocaleString()}</span>
                  </div>
                )}
                <Separator className="bg-green-200" />
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-gray-900">Grand Total:</span>
                  <span className="text-green-600">
                    Rs. {(
                      (order.price || 1500) * parseInt(order.quantity) + 
                      (order.deliveryCharge || 200) - 
                      (order.discount || 0)
                    ).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            

            {/* Footer Note */}
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-xs text-gray-600 text-center leading-relaxed">
                Thank you for your business! This is a computer-generated invoice and does not require a signature.
                <br />
                For any queries, please contact our support team.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end pt-4 border-t border-green-100">
              <Button
                variant="outline"
                onClick={onClose}
                className="px-6 border-green-300 text-green-700 hover:bg-green-50"
              >
                Close
              </Button>
              <Button
                onClick={() => onDownload(order)}
                className="bg-green-600 hover:bg-green-700 px-6 text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Invoice
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
