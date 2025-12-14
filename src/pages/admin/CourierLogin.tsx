import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/logo.png";
import { loginUser } from "@/services/authService";

const CourierLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    console.log("🚀 Login attempt started...");
    console.log("Email:", formData.email);
    console.log("Password length:", formData.password.length);
    
    try {
      const email = formData.email.trim();
      const password = formData.password.trim();
      
      console.log("📤 Sending to API...");
      const res = await loginUser({ email, password });
      
      console.log("📥 API Response received:", res);
      console.log("Response type:", typeof res);
      console.log("Response keys:", res ? Object.keys(res) : "No response");
      
      // Check if response is what we expect
      if (res && res.success && res.token && res.user) {
        console.log("✅ Valid response received");
        console.log("User role:", res.user.role);
        console.log("User email:", res.user.email);
        
        if (res.user.role === "courier") {
          localStorage.setItem("courierAuthToken", res.token);
          console.log("✅ Token saved to localStorage");
          
          toast({ 
            title: "Login Successful", 
            description: "Welcome to courier dashboard" 
          });
          navigate("/admin/courier");
        } else {
          console.log("❌ User role is not courier:", res.user.role);
          toast({ 
            title: "Access Denied", 
            description: `Your role is ${res.user.role}. Courier access only.`, 
            variant: "destructive" 
          });
        }
      } else {
        console.log("❌ Invalid response structure");
        console.log("Has success:", res?.success);
        console.log("Has token:", !!res?.token);
        console.log("Has user:", !!res?.user);
        console.log("Message:", res?.message);
        
        toast({ 
          title: "Login Failed", 
          description: res?.message || "Invalid response from server", 
          variant: "destructive" 
        });
      }
      
    } catch (err: any) {
      console.error("🔥 Login error:", err);
      console.error("Error message:", err.message);
      console.error("Error stack:", err.stack);
      
      toast({ 
        title: "Login Failed", 
        description: err.message || "Network error. Check console for details.", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
      console.log("🏁 Login process finished");
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <img src={logo} alt="Logo" className="h-12 mx-auto mb-2" />
          <CardTitle className="text-center">Courier Service Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                placeholder="courier@nirvaan.lk"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <Input
                type="password"
                placeholder="courier123"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                required
                className="w-full"
              />
            </div>
            <div className="text-sm text-muted-foreground text-center">
              <p>Test credentials:</p>
              <p>Email: courier@nirvaan.lk</p>
              <p>Password: courier123</p>
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              loading={loading}
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login as Courier"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CourierLogin;
// Username/Email: courier@nirvaan.lk
// Password: courier123