
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Pencil, Plus, Trash2 } from "lucide-react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Class } from "@/lib/types";
import { mockFetchClasses, mockCreateClass, mockUpdateClass, mockDeleteClass } from "@/lib/mockApi";
import { useToast } from "@/hooks/use-toast";

// Schema for form validation
const classSchema = z.object({
  name: z.string().min(1, "Name is required"),
  level: z.coerce.number().int().positive("Level must be a positive number"),
});

type ClassFormValues = z.infer<typeof classSchema>;

export default function Classes() {
  const { toast } = useToast();
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentClass, setCurrentClass] = useState<Class | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Form setup for adding class
  const addForm = useForm<ClassFormValues>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      name: "",
      level: 1,
    },
  });

  // Form setup for editing class
  const editForm = useForm<ClassFormValues>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      name: "",
      level: 1,
    },
  });

  // Load classes on component mount
  useEffect(() => {
    async function loadClasses() {
      setIsLoading(true);
      try {
        const data = await mockFetchClasses();
        setClasses(data);
      } catch (error) {
        console.error("Failed to fetch classes:", error);
        toast({
          title: "Error",
          description: "Failed to load classes",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadClasses();
  }, [toast]);

  // Handle form submission for adding class
  const handleAddSubmit = async (data: ClassFormValues) => {
    try {
      const newClass = await mockCreateClass({
        name: data.name,
        level: data.level,
      });
      
      setClasses(prev => [...prev, newClass]);
      setIsAddDialogOpen(false);
      addForm.reset();
      
      toast({
        title: "Success",
        description: "Class added successfully",
      });
    } catch (error) {
      console.error("Failed to create class:", error);
      toast({
        title: "Error",
        description: "Failed to create class",
        variant: "destructive",
      });
    }
  };

  // Handle form submission for editing class
  const handleEditSubmit = async (data: ClassFormValues) => {
    if (!currentClass) return;
    
    try {
      const updatedClass = await mockUpdateClass(
        currentClass.id,
        {
          name: data.name,
          level: data.level,
        }
      );
      
      setClasses(prev =>
        prev.map(cls => (cls.id === currentClass.id ? updatedClass : cls))
      );
      setIsEditDialogOpen(false);
      setCurrentClass(null);
      
      toast({
        title: "Success",
        description: "Class updated successfully",
      });
    } catch (error) {
      console.error("Failed to update class:", error);
      toast({
        title: "Error",
        description: "Failed to update class",
        variant: "destructive",
      });
    }
  };

  // Open edit dialog and populate form with current data
  const handleEdit = (classData: Class) => {
    setCurrentClass(classData);
    editForm.reset({
      name: classData.name,
      level: classData.level,
    });
    setIsEditDialogOpen(true);
  };

  // Open delete confirmation dialog
  const handleDeleteClick = (classData: Class) => {
    setCurrentClass(classData);
    setIsDeleteDialogOpen(true);
  };

  // Handle class deletion
  const handleDelete = async () => {
    if (!currentClass) return;
    
    try {
      await mockDeleteClass(currentClass.id);
      
      setClasses(prev => prev.filter(cls => cls.id !== currentClass.id));
      setIsDeleteDialogOpen(false);
      setCurrentClass(null);
      
      toast({
        title: "Success",
        description: "Class deleted successfully",
      });
    } catch (error) {
      console.error("Failed to delete class:", error);
      toast({
        title: "Error",
        description: "Failed to delete class",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Classes</h1>
            <p className="text-muted-foreground">
              Manage classes for your institution
            </p>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add Class
          </Button>
        </div>

        {/* Classes Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Level</TableHead>
                <TableHead className="w-[150px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : classes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    No classes found. Add your first one.
                  </TableCell>
                </TableRow>
              ) : (
                classes.map((classItem) => (
                  <TableRow key={classItem.id}>
                    <TableCell>{classItem.name}</TableCell>
                    <TableCell>{classItem.level}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(classItem)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteClick(classItem)}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-red-500" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Add Class Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Class</DialogTitle>
            <DialogDescription>
              Create a new class for your institution.
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
                      <Input placeholder="Grade 10" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={addForm.control}
                name="level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Level</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
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

      {/* Edit Class Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Class</DialogTitle>
            <DialogDescription>
              Update the details of this class.
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
              <FormField
                control={editForm.control}
                name="level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Level</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
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
                    setCurrentClass(null);
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this class? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setCurrentClass(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
