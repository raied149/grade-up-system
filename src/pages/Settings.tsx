
import React, { useState } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { User } from "@/lib/types";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  
  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    attendanceAlerts: true,
    taskReminders: true,
    systemUpdates: false
  });
  
  const [securityForm, setSecurityForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [emailUpdateForm, setEmailUpdateForm] = useState({
    newEmail: "",
    confirmEmail: ""
  });
  
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would update the user profile on the server
    if (user) {
      const updatedUser = {
        ...user,
        name: profileForm.name,
        email: profileForm.email,
      };
      
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      toast.success("Profile updated successfully");
    }
  };
  
  const handleNotificationChange = (key: string) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof notificationSettings]
    }));
  };
  
  const handleSecuritySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate passwords
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    
    if (securityForm.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    
    // In a real app, this would update the password on the server
    toast.success("Password updated successfully");
    
    // Reset form
    setSecurityForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });
  };

  const handleEmailUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (emailUpdateForm.newEmail !== emailUpdateForm.confirmEmail) {
      toast.error("Emails don't match");
      return;
    }
    
    if (user) {
      const updatedUser = {
        ...user,
        email: emailUpdateForm.newEmail
      };
      
      setUser(updatedUser);
      setProfileForm({...profileForm, email: emailUpdateForm.newEmail});
      localStorage.setItem("user", JSON.stringify(updatedUser));
      toast.success("Email updated successfully");
      
      // Reset form
      setEmailUpdateForm({
        newEmail: "",
        confirmEmail: ""
      });
    }
  };
  
  // If user is not logged in, redirect to login page
  if (!user) {
    navigate("/");
    return null;
  }
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>
        
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="email">Update Email</TabsTrigger>
          </TabsList>
          
          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <form onSubmit={handleProfileSubmit}>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your personal information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                      required
                    />
                  </div>
                    
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileForm.email}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-sm text-muted-foreground">
                      To update your email address, please use the "Update Email" tab.
                    </p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit">Save Changes</Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          
          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Choose how you want to be notified
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive email notifications about account activity
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={() => handleNotificationChange('emailNotifications')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Attendance Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified about attendance updates and issues
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.attendanceAlerts}
                    onCheckedChange={() => handleNotificationChange('attendanceAlerts')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Task Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive reminders about upcoming tasks and deadlines
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.taskReminders}
                    onCheckedChange={() => handleNotificationChange('taskReminders')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>System Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified about system updates and maintenance
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.systemUpdates}
                    onCheckedChange={() => handleNotificationChange('systemUpdates')}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={() => toast.success("Notification settings saved")}>
                  Save Preferences
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Security Tab */}
          <TabsContent value="security">
            <Card>
              <form onSubmit={handleSecuritySubmit}>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>
                    Update your password and security preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={securityForm.currentPassword}
                      onChange={(e) => setSecurityForm({...securityForm, currentPassword: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={securityForm.newPassword}
                      onChange={(e) => setSecurityForm({...securityForm, newPassword: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={securityForm.confirmPassword}
                      onChange={(e) => setSecurityForm({...securityForm, confirmPassword: e.target.value})}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit">Update Password</Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          {/* Email Update Tab */}
          <TabsContent value="email">
            <Card>
              <form onSubmit={handleEmailUpdate}>
                <CardHeader>
                  <CardTitle>Update Email Address</CardTitle>
                  <CardDescription>
                    Change your email address used for account access and notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentEmail">Current Email</Label>
                    <Input
                      id="currentEmail"
                      type="email"
                      value={user.email}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="newEmail">New Email</Label>
                    <Input
                      id="newEmail"
                      type="email"
                      value={emailUpdateForm.newEmail}
                      onChange={(e) => setEmailUpdateForm({...emailUpdateForm, newEmail: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmEmail">Confirm New Email</Label>
                    <Input
                      id="confirmEmail"
                      type="email"
                      value={emailUpdateForm.confirmEmail}
                      onChange={(e) => setEmailUpdateForm({...emailUpdateForm, confirmEmail: e.target.value})}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit">Update Email</Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
