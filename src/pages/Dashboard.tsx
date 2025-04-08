
import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Clock, FileText, Users, UserCheck, AlertTriangle, BookOpen, Calendar as CalendarIcon } from "lucide-react";
import CalendarWidget from "@/components/dashboard/CalendarWidget";
import AttendanceSummary from "@/components/dashboard/AttendanceSummary";
import { User, UserRole } from "@/lib/types";
import { mockCalendarEvents, mockAttendanceSummaries, mockStudents, mockTeachers, mockTeacherAttendance, mockTasks } from "@/lib/mockData";

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  if (!user) {
    return <div>Loading...</div>;
  }

  const totalStudents = mockStudents.length;
  const totalTeachers = mockTeachers.length;
  const studentsWithHighAttendance = mockStudents.filter(student => student.attendancePercentage >= 90).length;
  const pendingTasks = mockTasks.filter(task => task.status === "pending").length;
  const teachersPresent = mockTeacherAttendance.filter(ta => ta.date === "2025-04-08" && ta.status === "present").length;
  const upcomingEvents = mockCalendarEvents.filter(event => new Date(event.start) >= new Date()).length;

  // Recent attendance summary
  const recentAttendance = mockAttendanceSummaries[0];

  // Role-specific cards
  const getStatsCards = (role: UserRole) => {
    // Cards for all roles
    const commonCards = [
      {
        title: "Pending Tasks",
        value: pendingTasks,
        description: "Tasks awaiting completion",
        icon: <FileText className="h-5 w-5" />,
        color: "bg-amber-500",
      },
      {
        title: "Upcoming Events",
        value: upcomingEvents,
        description: "Events scheduled",
        icon: <CalendarIcon className="h-5 w-5" />,
        color: "bg-purple-500",
      },
    ];

    // Admin and teacher cards
    const staffCards = [
      {
        title: "Total Students",
        value: totalStudents,
        description: "Enrolled students",
        icon: <Users className="h-5 w-5" />,
        color: "bg-primary",
      },
      {
        title: "Teachers Present",
        value: teachersPresent,
        description: "Out of " + totalTeachers,
        icon: <UserCheck className="h-5 w-5" />,
        color: "bg-green-500",
      },
    ];

    // Admin-specific cards
    const adminCards = [
      {
        title: "High Attendance",
        value: studentsWithHighAttendance,
        description: "Students >90% attendance",
        icon: <Check className="h-5 w-5" />,
        color: "bg-secondary",
      },
    ];

    // Student-specific cards
    const studentCards = [
      {
        title: "Attendance Rate",
        value: "92%",
        description: "Your attendance rate",
        icon: <UserCheck className="h-5 w-5" />,
        color: "bg-green-500",
      },
      {
        title: "Upcoming Tests",
        value: 2,
        description: "This week",
        icon: <BookOpen className="h-5 w-5" />,
        color: "bg-red-500",
      },
    ];

    switch (role) {
      case "admin":
        return [...staffCards, ...adminCards, ...commonCards];
      case "teacher":
        return [...staffCards, ...commonCards];
      case "student":
        return [...studentCards, ...commonCards];
      default:
        return commonCards;
    }
  };

  const statsCards = getStatsCards(user.role);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user.name}!
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statsCards.map((card, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">
                  {card.title}
                </CardTitle>
                <div className={`${card.color} p-2 rounded-full text-white`}>
                  {card.icon}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              {/* Attendance Summary */}
              <Card className="lg:col-span-4">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Summary of attendance and recent tasks
                  </CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <div className="space-y-8">
                    {/* Task list */}
                    <div>
                      <h4 className="text-sm font-medium mb-4 pl-2">Recent Tasks</h4>
                      <div className="space-y-2">
                        {mockTasks.slice(0, 3).map((task) => (
                          <div 
                            key={task.id}
                            className="flex items-center p-2 rounded-md hover:bg-gray-100"
                          >
                            <div className="mr-4">
                              {task.status === "completed" ? (
                                <div className="h-8 w-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                                  <Check className="h-4 w-4" />
                                </div>
                              ) : task.status === "overdue" ? (
                                <div className="h-8 w-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
                                  <AlertTriangle className="h-4 w-4" />
                                </div>
                              ) : (
                                <div className="h-8 w-8 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center">
                                  <Clock className="h-4 w-4" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <h5 className="font-medium">{task.title}</h5>
                              <p className="text-sm text-muted-foreground">Due {task.dueDate}</p>
                            </div>
                            <div>
                              <span className={`text-xs px-2 py-1 rounded-full ${task.priority === "high" 
                                ? "bg-red-100 text-red-800" 
                                : task.priority === "medium" 
                                  ? "bg-amber-100 text-amber-800" 
                                  : "bg-green-100 text-green-800"}`}>
                                {task.priority}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Calendar Widget */}
              <div className="lg:col-span-3">
                <CalendarWidget events={mockCalendarEvents} />
              </div>
            </div>
            
            {/* Attendance Summary */}
            <div className="grid gap-4 md:grid-cols-2">
              <AttendanceSummary data={recentAttendance} />
              
              {/* Quick Links */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Access</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <button className="flex flex-col items-center justify-center p-4 rounded-lg border border-border hover:bg-gray-50 transition-colors">
                      <UserCheck className="h-8 w-8 mb-2 text-primary" />
                      <span className="text-sm">Mark Attendance</span>
                    </button>
                    <button className="flex flex-col items-center justify-center p-4 rounded-lg border border-border hover:bg-gray-50 transition-colors">
                      <FileText className="h-8 w-8 mb-2 text-primary" />
                      <span className="text-sm">Create Task</span>
                    </button>
                    <button className="flex flex-col items-center justify-center p-4 rounded-lg border border-border hover:bg-gray-50 transition-colors">
                      <CalendarIcon className="h-8 w-8 mb-2 text-primary" />
                      <span className="text-sm">Schedule</span>
                    </button>
                    <button className="flex flex-col items-center justify-center p-4 rounded-lg border border-border hover:bg-gray-50 transition-colors">
                      <Users className="h-8 w-8 mb-2 text-primary" />
                      <span className="text-sm">Students</span>
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="analytics" className="p-6 flex items-center justify-center min-h-[300px] bg-muted/20 rounded-md">
            <p className="text-muted-foreground text-center">
              Analytics dashboard coming soon
            </p>
          </TabsContent>
          
          <TabsContent value="reports" className="p-6 flex items-center justify-center min-h-[300px] bg-muted/20 rounded-md">
            <p className="text-muted-foreground text-center">
              Reports dashboard coming soon
            </p>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
