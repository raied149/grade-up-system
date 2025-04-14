
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CalendarIcon, Pencil, Plus } from "lucide-react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AcademicYear } from "@/lib/types";
import { cn } from "@/lib/utils";
import { mockFetchAcademicYears, mockCreateAcademicYear, mockUpdateAcademicYear } from "@/lib/mockApi";
import { useToast } from "@/hooks/use-toast";

// Schema for form validation
const academicYearSchema = z.object({
  name: z.string().min(1, "Name is required"),
  startDate: z.date({
    required_error: "Start date is required",
  }),
  endDate: z.date({
    required_error: "End date is required",
  }).refine(data => data > new Date(), {
    message: "End date must be in the future",
  }),
  status: z.enum(["active", "archived"], {
    required_error: "Status is required",
  }),
});

type AcademicYearFormValues = z.infer<typeof academicYearSchema>;

export default function AcademicYears() {
  const { toast } = useToast();
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentAcademicYear, setCurrentAcademicYear] = useState<AcademicYear | null>(null);

  // Form setup for adding academic year
  const addForm = useForm<AcademicYearFormValues>({
    resolver: zodResolver(academicYearSchema),
    defaultValues: {
      name: "",
      status: "archived",
    },
  });

  // Form setup for editing academic year
  const editForm = useForm<AcademicYearFormValues>({
    resolver: zodResolver(academicYearSchema),
    defaultValues: {
      name: "",
      status: "archived",
    },
  });

  // Load academic years on component mount
  useEffect(() => {
    async function loadAcademicYears() {
      setIsLoading(true);
      try {
        const data = await mockFetchAcademicYears();
        setAcademicYears(data);
      } catch (error) {
        console.error("Failed to fetch academic years:", error);
        toast({
          title: "Error",
          description: "Failed to load academic years",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadAcademicYears();
  }, [toast]);

  // Handle form submission for adding academic year
  const handleAddSubmit = async (data: AcademicYearFormValues) => {
    try {
      const startDateStr = format(data.startDate, "yyyy-MM-dd");
      const endDateStr = format(data.endDate, "yyyy-MM-dd");
      
      const newAcademicYear = await mockCreateAcademicYear({
        name: data.name,
        startDate: startDateStr,
        endDate: endDateStr,
        status: data.status,
      });
      
      setAcademicYears(prev => [...prev, newAcademicYear]);
      setIsAddDialogOpen(false);
      addForm.reset();
      
      toast({
        title: "Success",
        description: "Academic year added successfully",
      });
    } catch (error) {
      console.error("Failed to create academic year:", error);
      toast({
        title: "Error",
        description: "Failed to create academic year",
        variant: "destructive",
      });
    }
  };

  // Handle form submission for editing academic year
  const handleEditSubmit = async (data: AcademicYearFormValues) => {
    if (!currentAcademicYear) return;
    
    try {
      const startDateStr = format(data.startDate, "yyyy-MM-dd");
      const endDateStr = format(data.endDate, "yyyy-MM-dd");
      
      const updatedAcademicYear = await mockUpdateAcademicYear(
        currentAcademicYear.id,
        {
          name: data.name,
          startDate: startDateStr,
          endDate: endDateStr,
          status: data.status,
        }
      );
      
      setAcademicYears(prev =>
        prev.map(ay => (ay.id === currentAcademicYear.id ? updatedAcademicYear : ay))
      );
      setIsEditDialogOpen(false);
      setCurrentAcademicYear(null);
      
      toast({
        title: "Success",
        description: "Academic year updated successfully",
      });
    } catch (error) {
      console.error("Failed to update academic year:", error);
      toast({
        title: "Error",
        description: "Failed to update academic year",
        variant: "destructive",
      });
    }
  };

  // Open edit dialog and populate form with current data
  const handleEdit = (academicYear: AcademicYear) => {
    setCurrentAcademicYear(academicYear);
    editForm.reset({
      name: academicYear.name,
      startDate: new Date(academicYear.startDate),
      endDate: new Date(academicYear.endDate),
      status: academicYear.status,
    });
    setIsEditDialogOpen(true);
  };

  // Set an academic year as active
  const handleSetActive = async (academicYear: AcademicYear) => {
    try {
      // First set all to archived
      const updatedYears = await Promise.all(
        academicYears
          .filter(ay => ay.status === "active")
          .map(ay => mockUpdateAcademicYear(ay.id, { status: "archived" }))
      );
      
      // Then set the selected one to active
      const updatedActiveYear = await mockUpdateAcademicYear(
        academicYear.id,
        { status: "active" }
      );
      
      // Update local state
      setAcademicYears(prev =>
        prev.map(ay => {
          if (ay.id === academicYear.id) return updatedActiveYear;
          if (ay.status === "active") return { ...ay, status: "archived" };
          return ay;
        })
      );
      
      toast({
        title: "Success",
        description: `Academic year ${academicYear.name} is now active`,
      });
    } catch (error) {
      console.error("Failed to update academic year status:", error);
      toast({
        title: "Error",
        description: "Failed to update academic year status",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Academic Years</h1>
            <p className="text-muted-foreground">
              Manage academic years for your institution
            </p>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add Academic Year
          </Button>
        </div>

        {/* Academic Years Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[150px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : academicYears.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No academic years found. Add your first one.
                  </TableCell>
                </TableRow>
              ) : (
                academicYears.map((academicYear) => (
                  <TableRow key={academicYear.id}>
                    <TableCell>{academicYear.name}</TableCell>
                    <TableCell>
                      {format(new Date(academicYear.startDate), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      {format(new Date(academicYear.endDate), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
                          academicYear.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        )}
                      >
                        {academicYear.status === "active" ? "Active" : "Archived"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(academicYear)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        {academicYear.status !== "active" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSetActive(academicYear)}
                          >
                            Set Active
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Add Academic Year Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Academic Year</DialogTitle>
            <DialogDescription>
              Create a new academic year for your institution.
            </DialogDescription>
          </DialogHeader>
          <Form {...addForm}>
            <form onSubmit={addForm.handleSubmit(handleAddSubmit)} className="space-y-4">
              <FormField
                control={addForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="2024-2025" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={addForm.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={addForm.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={addForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    addForm.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">Save</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Academic Year Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Academic Year</DialogTitle>
            <DialogDescription>
              Update the details of this academic year.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={editForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setCurrentAcademicYear(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">Update</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
