
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Pencil, Plus, Trash2, Filter } from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Section, AcademicYear, Class, Teacher } from "@/lib/types";
import {
  mockFetchSections,
  mockFetchAcademicYears,
  mockFetchClasses,
  mockFetchTeachers,
  mockCreateSection,
  mockUpdateSection,
  mockDeleteSection,
} from "@/lib/mockApi";
import { useToast } from "@/hooks/use-toast";

// Schema for form validation
const sectionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  academicYearId: z.string().min(1, "Academic Year is required"),
  classId: z.string().min(1, "Class is required"),
  homeroomTeacherId: z.string().optional(),
});

type SectionFormValues = z.infer<typeof sectionSchema>;

export default function Sections() {
  const { toast } = useToast();
  const [sections, setSections] = useState<Section[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState<Section | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [filterAcademicYearId, setFilterAcademicYearId] = useState<string>("");
  const [filterClassId, setFilterClassId] = useState<string>("");

  // Form setup for adding section
  const addForm = useForm<SectionFormValues>({
    resolver: zodResolver(sectionSchema),
    defaultValues: {
      name: "",
    },
  });

  // Form setup for editing section
  const editForm = useForm<SectionFormValues>({
    resolver: zodResolver(sectionSchema),
    defaultValues: {
      name: "",
    },
  });

  // Load lookup data on component mount
  useEffect(() => {
    async function loadLookupData() {
      setIsLoading(true);
      try {
        const [academicYearsData, classesData, teachersData] = await Promise.all([
          mockFetchAcademicYears(),
          mockFetchClasses(),
          mockFetchTeachers(),
        ]);
        
        setAcademicYears(academicYearsData);
        setClasses(classesData);
        setTeachers(teachersData);
        
        // Set default filter to active academic year if one exists
        const activeYear = academicYearsData.find(ay => ay.status === "active");
        if (activeYear) {
          setFilterAcademicYearId(activeYear.id);
        }
      } catch (error) {
        console.error("Failed to fetch lookup data:", error);
        toast({
          title: "Error",
          description: "Failed to load necessary data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadLookupData();
  }, [toast]);

  // Load sections based on filters
  useEffect(() => {
    async function loadSections() {
      setIsLoading(true);
      try {
        const filters: { academicYearId?: string; classId?: string } = {};
        if (filterAcademicYearId) filters.academicYearId = filterAcademicYearId;
        if (filterClassId) filters.classId = filterClassId;
        
        const data = await mockFetchSections(filters);
        setSections(data);
      } catch (error) {
        console.error("Failed to fetch sections:", error);
        toast({
          title: "Error",
          description: "Failed to load sections",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadSections();
  }, [filterAcademicYearId, filterClassId, toast]);

  // Handle form submission for adding section
  const handleAddSubmit = async (data: SectionFormValues) => {
    try {
      const newSection = await mockCreateSection({
        name: data.name,
        academicYearId: data.academicYearId,
        classId: data.classId,
        homeroomTeacherId: data.homeroomTeacherId,
      });
      
      setSections(prev => [...prev, newSection]);
      setIsAddDialogOpen(false);
      addForm.reset();
      
      toast({
        title: "Success",
        description: "Section added successfully",
      });
    } catch (error) {
      console.error("Failed to create section:", error);
      toast({
        title: "Error",
        description: "Failed to create section",
        variant: "destructive",
      });
    }
  };

  // Handle form submission for editing section
  const handleEditSubmit = async (data: SectionFormValues) => {
    if (!currentSection) return;
    
    try {
      const updatedSection = await mockUpdateSection(
        currentSection.id,
        {
          name: data.name,
          academicYearId: data.academicYearId,
          classId: data.classId,
          homeroomTeacherId: data.homeroomTeacherId,
        }
      );
      
      setSections(prev =>
        prev.map(sec => (sec.id === currentSection.id ? updatedSection : sec))
      );
      setIsEditDialogOpen(false);
      setCurrentSection(null);
      
      toast({
        title: "Success",
        description: "Section updated successfully",
      });
    } catch (error) {
      console.error("Failed to update section:", error);
      toast({
        title: "Error",
        description: "Failed to update section",
        variant: "destructive",
      });
    }
  };

  // Open edit dialog and populate form with current data
  const handleEdit = (section: Section) => {
    setCurrentSection(section);
    editForm.reset({
      name: section.name,
      academicYearId: section.academicYearId,
      classId: section.classId,
      homeroomTeacherId: section.homeroomTeacherId,
    });
    setIsEditDialogOpen(true);
  };

  // Open delete confirmation dialog
  const handleDeleteClick = (section: Section) => {
    setCurrentSection(section);
    setIsDeleteDialogOpen(true);
  };

  // Handle section deletion
  const handleDelete = async () => {
    if (!currentSection) return;
    
    try {
      await mockDeleteSection(currentSection.id);
      
      setSections(prev => prev.filter(sec => sec.id !== currentSection.id));
      setIsDeleteDialogOpen(false);
      setCurrentSection(null);
      
      toast({
        title: "Success",
        description: "Section deleted successfully",
      });
    } catch (error) {
      console.error("Failed to delete section:", error);
      toast({
        title: "Error",
        description: "Failed to delete section",
        variant: "destructive",
      });
    }
  };

  // Helper function to get entity name by ID
  const getAcademicYearName = (id: string) => {
    return academicYears.find(ay => ay.id === id)?.name || "Unknown";
  };
  
  const getClassName = (id: string) => {
    return classes.find(c => c.id === id)?.name || "Unknown";
  };
  
  const getTeacherName = (id?: string) => {
    return id ? (teachers.find(t => t.id === id)?.name || "Unknown") : "Not Assigned";
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Sections</h1>
            <p className="text-muted-foreground">
              Manage sections for your institution's classes
            </p>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add Section
          </Button>
        </div>

        {/* Filters Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center">
              <Filter className="h-4 w-4 mr-2" /> Filters
            </CardTitle>
            <CardDescription>
              Filter sections by academic year and class
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="academicYearFilter">Academic Year</Label>
                <Select
                  value={filterAcademicYearId}
                  onValueChange={setFilterAcademicYearId}
                >
                  <SelectTrigger id="academicYearFilter">
                    <SelectValue placeholder="Select Academic Year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Academic Years</SelectItem>
                    {academicYears.map(year => (
                      <SelectItem key={year.id} value={year.id}>
                        {year.name} {year.status === "active" ? "(Active)" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="classFilter">Class</Label>
                <Select
                  value={filterClassId}
                  onValueChange={setFilterClassId}
                >
                  <SelectTrigger id="classFilter">
                    <SelectValue placeholder="Select Class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Classes</SelectItem>
                    {classes.map(classItem => (
                      <SelectItem key={classItem.id} value={classItem.id}>
                        {classItem.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sections Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Academic Year</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Homeroom Teacher</TableHead>
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
              ) : sections.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No sections found. Add your first one or adjust your filters.
                  </TableCell>
                </TableRow>
              ) : (
                sections.map((section) => (
                  <TableRow key={section.id}>
                    <TableCell>{section.name}</TableCell>
                    <TableCell>{getAcademicYearName(section.academicYearId)}</TableCell>
                    <TableCell>{getClassName(section.classId)}</TableCell>
                    <TableCell>{getTeacherName(section.homeroomTeacherId)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(section)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteClick(section)}
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

      {/* Add Section Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Section</DialogTitle>
            <DialogDescription>
              Create a new section for a class and academic year.
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
                      <Input placeholder="A" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={addForm.control}
                name="academicYearId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Academic Year</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Academic Year" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {academicYears.map(year => (
                          <SelectItem key={year.id} value={year.id}>
                            {year.name} {year.status === "active" ? "(Active)" : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={addForm.control}
                name="classId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Class" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {classes.map(classItem => (
                          <SelectItem key={classItem.id} value={classItem.id}>
                            {classItem.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={addForm.control}
                name="homeroomTeacherId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Homeroom Teacher</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Teacher (Optional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {teachers.map(teacher => (
                          <SelectItem key={teacher.id} value={teacher.id}>
                            {teacher.name}
                          </SelectItem>
                        ))}
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

      {/* Edit Section Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Section</DialogTitle>
            <DialogDescription>
              Update the details of this section.
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
                name="academicYearId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Academic Year</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Academic Year" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {academicYears.map(year => (
                          <SelectItem key={year.id} value={year.id}>
                            {year.name} {year.status === "active" ? "(Active)" : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="classId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Class" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {classes.map(classItem => (
                          <SelectItem key={classItem.id} value={classItem.id}>
                            {classItem.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="homeroomTeacherId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Homeroom Teacher</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Teacher (Optional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {teachers.map(teacher => (
                          <SelectItem key={teacher.id} value={teacher.id}>
                            {teacher.name}
                          </SelectItem>
                        ))}
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
                    setCurrentSection(null);
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
              Are you sure you want to delete this section? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setCurrentSection(null);
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
