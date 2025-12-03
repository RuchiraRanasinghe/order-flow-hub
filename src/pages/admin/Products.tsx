import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Plus, Edit, Trash2 } from "lucide-react";
import productAd from "@/assets/product-ad.jpg";
import { useToast } from "@/hooks/use-toast";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/services/productService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Product {
  id?: string;
  name: string;
  price: number;
  status: string;
  image?: string;
}

const Products = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Product>({
    name: "",
    price: 0,
    status: "Available",
    image: "",
  });

  const token = localStorage.getItem("adminAuthToken") || "";

  // Load products
  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await getProducts();
      // Ensure data is an array
      const productsArray = Array.isArray(data) ? data : [];
      setProducts(productsArray);
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to load products", variant: "destructive" });
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Open modal for add/edit
  const openModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData(product);
    } else {
      setEditingProduct(null);
      setFormData({ name: "", price: 0, status: "Available", image: "" });
    }
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => setIsModalOpen(false);

  // Handle input change
  const handleChange = (field: keyof Product, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Submit add/edit
  const handleSubmit = async () => {
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id!, formData, token);
        toast({ title: "Updated", description: "Product updated successfully" });
      } else {
        await createProduct(formData, token);
        toast({ title: "Created", description: "Product created successfully" });
      }
      closeModal();
      loadProducts();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Operation failed", variant: "destructive" });
    }
  };

  // Delete product
  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      await deleteProduct(id, token);
      toast({ title: "Deleted", description: "Product deleted successfully" });
      loadProducts();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Delete failed", variant: "destructive" });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Products</h1>
            <p className="text-muted-foreground mt-2">Manage your product catalog</p>
          </div>
          <Button className="rounded-2xl" onClick={() => openModal()}>
            <Plus className="w-5 h-5 mr-2" /> Add Product
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No products found</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product.id}>
                <CardHeader>
                  <img
                    src={product.image || productAd}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" /> {product.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Price</span>
                    <span className="text-2xl font-bold text-primary">Rs. {product.price}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <span className={`font-medium ${product.status === "Available" ? "text-success" : "text-destructive"}`}>
                      {product.status}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 rounded-2xl" onClick={() => openModal(product)}>
                      <Edit className="w-4 h-4 mr-1" /> Edit
                    </Button>
                    <Button variant="destructive" className="flex-1 rounded-2xl" onClick={() => handleDelete(product.id)}>
                      <Trash2 className="w-4 h-4 mr-1" /> Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Add / Edit Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingProduct ? "Edit Product" : "Add Product"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <Input
                placeholder="Product Name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
              />
              <Input
                type="number"
                placeholder="Price"
                value={formData.price}
                onChange={(e) => handleChange("price", Number(e.target.value))}
              />
              <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Available">Available</SelectItem>
                  <SelectItem value="Unavailable">Unavailable</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Image URL"
                value={formData.image}
                onChange={(e) => handleChange("image", e.target.value)}
              />
            </div>
            <DialogFooter className="mt-4">
              <Button onClick={handleSubmit}>{editingProduct ? "Update" : "Add"} Product</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default Products;
