
import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { CalendarIcon, Clock, CheckCircle, AlertTriangle, Search, Plus, Calendar as CalendarIcon2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { mockTasks, mockTeachers } from "@/lib/mockData";
import { Task, User } from "@/lib/types";
import { toast } from "sonner";

const Tasks = () => {
  const [user, setUser] = useState<User | null>(null);
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  
  // Form state for new task
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    dueDate: new Date(),
    priority: "medium",
    assignedTo: [] as string[],
  });

  // Load user and tasks
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    
    setTasks(mockTasks);
  }, []);

  // Update task status
  const updateTaskStatus = (taskId: string, newStatus: "pending" | "completed" | "overdue") => {
    const updatedTasks = tasks.map(task => 
      task.id === taskId 
        ? { ...task, status: newStatus, updatedAt: new Date().toISOString() }
        : task
    );
    
    setTasks(updatedTasks);
    toast.success(`Task status updated to ${newStatus}`);
  };

  // Handle form submission to create a new task
  const handleCreateTask = () => {
    const now = new Date().toISOString();
    
    const task: Task = {
      id: `task-${Date.now()}`,
      title: newTask.title,
      description: newTask.description,
      dueDate: format(newTask.dueDate, "yyyy-MM-dd"),
      assignedBy: user?.id || "unknown",
      assignedTo: newTask.assignedTo,
      status: "pending",
      priority: newTask.priority as "low" | "medium" | "high",
      createdAt: now,
      updatedAt: now,
    };
    
    setTasks(prev => [task, ...prev]);
    setDialogOpen(false);
    
    // Reset form
    setNewTask({
      title: "",
      description: "",
      dueDate: new Date(),
      priority: "medium",
      assignedTo: [],
    });
    
    toast.success("New task created successfully");
  };

  // Filter tasks based on search, priority, and status
  const getFilteredTasks = (status: string) => {
    return tasks.filter(task => {
      const matchesSearch = 
        task.title.toLowerCase().includes(search.toLowerCase()) ||
        task.description.toLowerCase().includes(search.toLowerCase());
      
      const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
      const matchesStatus = status === "all" ? true : task.status === status;
      
      // For user role filtering (if user is a teacher, only show assigned tasks)
      const isRelevantToUser = user?.role === "admin" || 
        (user?.role === "teacher" && 
          (task.assignedBy === user.id || task.assignedTo.includes(user.id)));
      
      return matchesSearch && matchesPriority && matchesStatus && isRelevantToUser;
    });
  };

  // Get task count by status
  const getPendingCount = () => getFilteredTasks("pending").length;
  const getCompletedCount = () => getFilteredTasks("completed").length;
  const getOverdueCount = () => getFilteredTasks("overdue").length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
            <p className="text-muted-foreground">
              Manage, assign, and track tasks
            </p>
          </div>
          
          {/* Only admin and teachers can create tasks */}
          {user && (user.role === "admin" || user.role === "teacher") && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Task
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Task</DialogTitle>
                  <DialogDescription>
                    Add details for the new task. Click save when you're done.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      placeholder="Task title"
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Task description"
                      value={newTask.description}
                      onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dueDate">Due Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {newTask.dueDate ? format(newTask.dueDate, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={newTask.dueDate}
                            onSelect={(date) => date && setNewTask({ ...newTask, dueDate: date })}
                            initialFocus
                            className={cn("p-3 pointer-events-auto")}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority</Label>
                      <Select
                        value={newTask.priority}
                        onValueChange={(value) => setNewTask({ ...newTask, priority: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Assign To</Label>
                    <Select
                      value={newTask.assignedTo[0] || ""}
                      onValueChange={(value) => setNewTask({ ...newTask, assignedTo: [value] })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a teacher" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockTeachers.map((teacher) => (
                          <SelectItem key={teacher.id} value={teacher.id}>
                            {teacher.name} ({teacher.subject})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                  <Button 
                    onClick={handleCreateTask}
                    disabled={!newTask.title || !newTask.dueDate || newTask.assignedTo.length === 0}
                  >
                    Create Task
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {/* Priority Filter */}
          <div className="w-full md:w-64">
            <Select
              value={priorityFilter}
              onValueChange={setPriorityFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">
              Pending ({getPendingCount()})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({getCompletedCount()})
            </TabsTrigger>
            <TabsTrigger value="overdue">
              Overdue ({getOverdueCount()})
            </TabsTrigger>
            <TabsTrigger value="all">
              All Tasks
            </TabsTrigger>
          </TabsList>
          
          {["pending", "completed", "overdue", "all"].map(status => (
            <TabsContent key={status} value={status} className="space-y-4">
              {getFilteredTasks(status).length > 0 ? (
                getFilteredTasks(status).map((task) => (
                  <Card key={task.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{task.title}</CardTitle>
                        <div className="flex items-center space-x-2">
                          {task.status === "pending" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800"
                              onClick={() => updateTaskStatus(task.id, "completed")}
                            >
                              <CheckCircle className="mr-1 h-4 w-4" />
                              Mark Complete
                            </Button>
                          )}
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            task.priority === "high" 
                              ? "bg-red-100 text-red-800" 
                              : task.priority === "medium" 
                                ? "bg-amber-100 text-amber-800" 
                                : "bg-green-100 text-green-800"
                          }`}>
                            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">{task.description}</p>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center">
                          <CalendarIcon2 className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="text-sm">
                            Due: <span className={`font-medium ${
                              new Date(task.dueDate) < new Date() && task.status !== "completed" 
                                ? "text-red-600" 
                                : ""
                            }`}>
                              {format(new Date(task.dueDate), "PPP")}
                            </span>
                          </span>
                        </div>
                        
                        <div className="flex items-center">
                          {task.status === "pending" && (
                            <>
                              <Clock className="h-4 w-4 mr-2 text-amber-500" />
                              <span className="text-sm text-amber-700">Pending</span>
                            </>
                          )}
                          {task.status === "completed" && (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                              <span className="text-sm text-green-700">Completed</span>
                            </>
                          )}
                          {task.status === "overdue" && (
                            <>
                              <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
                              <span className="text-sm text-red-700">Overdue</span>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No {status !== "all" ? status : ""} tasks found matching your criteria
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Tasks;
