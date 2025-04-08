
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { login } from "@/lib/mockData";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Simulate login delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const user = login(email, password);
      
      if (user) {
        // Store user in localStorage for persistent auth
        localStorage.setItem("user", JSON.stringify(user));
        toast.success(`Welcome back, ${user.name}!`);
        navigate("/dashboard");
      } else {
        toast.error("Invalid email or password");
      }
    } catch (error) {
      toast.error("Login failed. Please try again.");
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (role: string) => {
    setIsLoading(true);
    
    let email = "";
    switch(role) {
      case "admin":
        email = "admin@school.edu";
        break;
      case "teacher":
        email = "michael.brown@school.edu";
        break;
      case "student":
        email = "alex.w@school.edu";
        break;
    }
    
    setTimeout(() => {
      const user = login(email, "password");
      
      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
        toast.success(`Logged in as ${user.name} (${user.role})`);
        navigate("/dashboard");
      }
      
      setIsLoading(false);
    }, 800);
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Sign In</CardTitle>
        <CardDescription className="text-center">
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="your.email@school.edu" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <a href="#" className="text-sm text-primary hover:underline">
                Forgot password?
              </a>
            </div>
            <Input 
              id="password" 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <div className="relative w-full">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-300"></span>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              Or continue with demo accounts
            </span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 w-full">
          <Button
            variant="outline"
            className="w-full text-xs"
            onClick={() => handleDemoLogin("admin")}
            disabled={isLoading}
          >
            Admin
          </Button>
          <Button
            variant="outline"
            className="w-full text-xs"
            onClick={() => handleDemoLogin("teacher")}
            disabled={isLoading}
          >
            Teacher
          </Button>
          <Button
            variant="outline"
            className="w-full text-xs"
            onClick={() => handleDemoLogin("student")}
            disabled={isLoading}
          >
            Student
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default LoginForm;
