import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Plus } from "lucide-react";
import productAd from "@/assets/product-ad.jpg";

const Products = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Products</h1>
            <p className="text-muted-foreground mt-2">Manage your product catalog</p>
          </div>
          <Button className="rounded-2xl">
            <Plus className="w-5 h-5 mr-2" />
            Add Product
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <img
                src={productAd}
                alt="Herbal Cream"
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                මීයා රෝගීන් ආත්තෝර ආලේපය
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Price</span>
                <span className="text-2xl font-bold text-primary">Rs. 10,000</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="text-success font-medium">Available</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 rounded-2xl">
                  Edit
                </Button>
                <Button variant="destructive" className="flex-1 rounded-2xl">
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Products;
