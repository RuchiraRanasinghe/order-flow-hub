import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";
import productAd from "@/assets/product-ad.jpg";
import { Star, Package, Clock, Shield } from "lucide-react";
import { createOrder } from "@/services/orderService";
import { createInquiry } from "@/services/inquiryService";

const testimonials = [
  { name: "නිමල් පෙරේරා", rating: 5, text: "මාස 2ක් භාවිතා කරපු පසු ඉතා හොඳ ප්‍රතිඵල දැක්කා. මිල වටිනවා!" },
  { name: "සුනිල් රත්නායක", rating: 5, text: "ඉතාමත් ඵලදායී නිෂ්පාදනයක්. පවුලේ හැමෝම භාවිතා කරනවා." },
  { name: "ප්‍රියංකා සිල්වා", rating: 5, text: "ස්වභාවික හා අතුරු ආබාධ නැති විශිෂ්ට නිෂ්පාදනයක්." },
  { name: "කමල් ජයසිංහ", rating: 5, text: "මාස 3කින් සම්පූර්ණ සුවයක් ලැබුණා. ස්තූතියි!" },
];

const Order = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [formData, setFormData] = useState({
    fullName: "",
    address: "",
    mobile: "",
    product: "herbal-cream",
    quantity: "1",
  });
  const [inquiry, setInquiry] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // Send order to backend API
      const result = await createOrder({
        fullName: formData.fullName,
        address: formData.address,
        mobile: formData.mobile,
        product: formData.product,
        quantity: parseInt(formData.quantity),
        status: "pending",
      });

      console.log('Order created successfully:', result);

      toast({
        title: "ඇණවුම සාර්ථකයි!",
        description: "ඔබගේ ඇණවුම අප වෙත ලැබී ඇත. ඉක්මනින් සම්බන්ධ වෙමු.",
      });

      setFormData({
        fullName: "",
        address: "",
        mobile: "",
        product: "herbal-cream",
        quantity: "1",
      });
    } catch (error: any) {
      console.error('Order submission error:', error);
      toast({
        title: "දෝෂයක්",
        description: error.message || "ඇණවුම සාර්ථක නොවීය. නැවත උත්සාහ කරන්න.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Send inquiry to backend API
      const result = await createInquiry({ message: inquiry });
      console.log('Inquiry submitted successfully:', result);

      toast({
        title: "විමසුම ලැබී ඇත",
        description: "අපි ඉක්මනින් ඔබව සම්බන්ධ කරගන්නෙමු.",
      });

      setInquiry("");
    } catch (error: any) {
      console.error('Inquiry submission error:', error);
      toast({
        title: "දෝෂයක්",
        description: error.message || "විමසුම යැවීම අසාර්ථක විය. නැවත උත්සාහ කරන්න.",
        variant: "destructive",
      });
    }
  };

  // Auto-scroll testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <img src={logo} alt="Logo" className="h-16 w-auto" />
          <Button
            variant="outline"
            onClick={() => navigate("/admin/login")}
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          >
            Admin Login
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            ටිනියා රෝගීන්
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            10,000 වැඩි සංඛ්‍යාවක් සුව ලත් කළ ආයුර්වේදික ආලේපය
          </p>
          <img
            src={productAd}
            alt="Product"
            className="w-full max-w-3xl mx-auto rounded-2xl shadow-2xl"
          />
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <Card>
            <CardContent className="pt-6 text-center">
              <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">100% ස්වභාවික</h3>
              <p className="text-sm text-muted-foreground">රසායනික නොමැත</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Package className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">නොමිලේ බෙදාහැරීම</h3>
              <p className="text-sm text-muted-foreground">දිවයින පුරා</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Clock className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">වේගවත් බෙදාහැරීම</h3>
              <p className="text-sm text-muted-foreground">දින 3-5 තුළ</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Star className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">තත්ත්ව සහතිකය</h3>
              <p className="text-sm text-muted-foreground">පරීක්ෂා කළ</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Order Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold mb-6 text-center">ඔබගේ ඇණවුම කරන්න</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">සම්පූර්ණ නම</label>
                    <Input
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="ඔබගේ නම ඇතුලත් කරන්න"
                      className="rounded-2xl"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">බෙදාහැරීමේ ලිපිනය</label>
                    <Textarea
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="සම්පූර්ණ ලිපිනය ඇතුලත් කරන්න"
                      className="rounded-2xl"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">ජංගම දුරකථන</label>
                    <Input
                      required
                      type="tel"
                      value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                      placeholder="07xxxxxxxx"
                      className="rounded-2xl"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">නිෂ්පාදනය තෝරන්න</label>
                    <Select value={formData.product} onValueChange={(value) => setFormData({ ...formData, product: value })}>
                      <SelectTrigger className="rounded-2xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="herbal-cream">ආත්තෝර ආලේපය - රු. 10,000</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">ප්‍රමාණය</label>
                    <Select value={formData.quantity} onValueChange={(value) => setFormData({ ...formData, quantity: value })}>
                      <SelectTrigger className="rounded-2xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 10].map((qty) => (
                          <SelectItem key={qty} value={qty.toString()}>
                            {qty}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full rounded-2xl h-12 text-lg font-semibold"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "ඇණවුම කරමින්..." : "ඇණවුම කරන්න"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Testimonials */}
            <Card className="shadow-xl">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4 text-center">පාරිභෝගික අදහස්</h3>
                <div className="space-y-4">
                  {testimonials.map((testimonial, index) => (
                    <div
                      key={index}
                      className={`transition-all duration-500 ${
                        index === currentTestimonial
                          ? "opacity-100 transform scale-100"
                          : "opacity-0 h-0 overflow-hidden transform scale-95"
                      }`}
                    >
                      {index === currentTestimonial && (
                        <div className="bg-muted rounded-2xl p-4">
                          <div className="flex items-center gap-2 mb-2">
                            {[...Array(testimonial.rating)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                            ))}
                          </div>
                          <p className="text-sm mb-2">{testimonial.text}</p>
                          <p className="text-xs font-semibold text-primary">- {testimonial.name}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Inquiry Form */}
            <Card className="shadow-xl">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4 text-center">විමසුම් / ගැටළු</h3>
                <form onSubmit={handleInquirySubmit} className="space-y-4">
                  <Textarea
                    required
                    value={inquiry}
                    onChange={(e) => setInquiry(e.target.value)}
                    placeholder="ඔබගේ විමසුම හෝ ගැටළුව මෙහි ලියන්න..."
                    className="rounded-2xl"
                    rows={4}
                  />
                  <Button type="submit" variant="outline" className="w-full rounded-2xl">
                    යවන්න
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-secondary text-secondary-foreground mt-16 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="font-semibold">NIRVAAN ENTERPRISES (PVT) LTD</p>
          <p className="text-sm mt-2">ලියාපදිංචි අංකය: PV 00332270</p>
          <p className="text-sm mt-2">දුරකථන: 070 161 7462</p>
        </div>
      </footer>
    </div>
  );
};

export default Order;
