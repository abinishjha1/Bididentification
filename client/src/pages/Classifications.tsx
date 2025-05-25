import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Search, Edit, Trash2, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

const classificationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  description: z.string().optional(),
});

type ClassificationFormValues = z.infer<typeof classificationSchema>;

export default function Classifications() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingClassification, setEditingClassification] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  
  // Fetch classifications
  const { data: classifications, isLoading } = useQuery({
    queryKey: ['/api/classifications'],
  });

  // Create classification mutation
  const createClassificationMutation = useMutation({
    mutationFn: async (data: ClassificationFormValues) => {
      const response = await apiRequest('POST', '/api/classifications', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Classification has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/classifications'] });
      setIsAddModalOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create classification. Please try again.",
        variant: "destructive",
      });
      console.error('Classification creation error:', error);
    }
  });

  // Update classification mutation
  const updateClassificationMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: ClassificationFormValues }) => {
      const response = await apiRequest('PATCH', `/api/classifications/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Classification has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/classifications'] });
      setEditingClassification(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update classification. Please try again.",
        variant: "destructive",
      });
      console.error('Classification update error:', error);
    }
  });

  // Delete classification mutation
  const deleteClassificationMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('DELETE', `/api/classifications/${id}`, undefined);
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Classification has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/classifications'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete classification. Please try again.",
        variant: "destructive",
      });
      console.error('Classification deletion error:', error);
    }
  });

  // Form handling
  const form = useForm<ClassificationFormValues>({
    resolver: zodResolver(classificationSchema),
    defaultValues: {
      name: "",
      category: "",
      description: "",
    },
  });

  // Reset form when opening the add modal
  const handleOpenAddModal = () => {
    form.reset({
      name: "",
      category: "",
      description: "",
    });
    setIsAddModalOpen(true);
  };

  // Set form values when editing a classification
  const handleEditClassification = (classification: any) => {
    form.reset({
      name: classification.name,
      category: classification.category,
      description: classification.description || "",
    });
    setEditingClassification(classification);
  };

  // Handle form submission
  const onSubmit = (data: ClassificationFormValues) => {
    if (editingClassification) {
      updateClassificationMutation.mutate({ id: editingClassification.id, data });
    } else {
      createClassificationMutation.mutate(data);
    }
  };

  // Filter classifications based on search and active tab
  const filteredClassifications = classifications?.filter((classification: any) => {
    const matchesSearch = searchQuery === "" || 
      classification.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      classification.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (classification.description && classification.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = activeTab === "all" || classification.category === activeTab;
    
    return matchesSearch && matchesCategory;
  });

  // Get all unique categories
  const categories = classifications ? 
    Array.from(new Set(classifications.map((c: any) => c.category))) : 
    [];

  // Get category display name
  const getCategoryDisplayName = (category: string) => {
    return category.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Get category badge color
  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'email_type':
        return 'bg-blue-100 text-blue-800';
      case 'value_range':
        return 'bg-green-100 text-green-800';
      case 'project_type':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Classification Management</h1>
        <Button className="flex items-center gap-2" onClick={handleOpenAddModal}>
          <Plus size={16} />
          <span>New Classification</span>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Classifications</CardTitle>
              <CardDescription>
                Manage classification tags for bids, emails, and projects.
              </CardDescription>
            </div>
            <div className="w-full sm:w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={16} />
                <Input
                  placeholder="Search classifications..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs 
            defaultValue="all" 
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-4"
          >
            <TabsList>
              <TabsTrigger value="all">All Categories</TabsTrigger>
              {categories.map((category: string) => (
                <TabsTrigger key={category} value={category}>
                  {getCategoryDisplayName(category)}
                </TabsTrigger>
              ))}
            </TabsList>
            
            <TabsContent value={activeTab} className="space-y-4">
              {isLoading ? (
                <div className="text-center py-8">Loading classifications...</div>
              ) : filteredClassifications?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredClassifications.map((classification: any) => (
                    <Card key={classification.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center">
                            <Tag size={16} className="mr-2 text-primary-600" />
                            <CardTitle className="text-base">{classification.name}</CardTitle>
                          </div>
                          <Badge className={getCategoryBadgeColor(classification.category)}>
                            {getCategoryDisplayName(classification.category)}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0 pb-2">
                        <p className="text-sm text-neutral-600">
                          {classification.description || "No description provided"}
                        </p>
                      </CardContent>
                      <div className="px-6 py-2 flex justify-end gap-2 border-t border-neutral-100">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-8 px-2 text-xs"
                          onClick={() => handleEditClassification(classification)}
                        >
                          <Edit size={14} className="mr-1" />
                          Edit
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-8 px-2 text-xs text-destructive hover:text-destructive"
                          onClick={() => {
                            if (confirm("Are you sure you want to delete this classification?")) {
                              deleteClassificationMutation.mutate(classification.id);
                            }
                          }}
                        >
                          <Trash2 size={14} className="mr-1" />
                          Delete
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-neutral-500">
                  No classifications found. {searchQuery && "Try adjusting your search criteria."}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Classification Form Modal */}
      <Dialog 
        open={isAddModalOpen || !!editingClassification} 
        onOpenChange={(open) => {
          if (!open) {
            setIsAddModalOpen(false);
            setEditingClassification(null);
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingClassification ? "Edit Classification" : "Add New Classification"}</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Classification Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter classification name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Select 
                        value={field.value} 
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="email_type">Email Type</SelectItem>
                          <SelectItem value="value_range">Value Range</SelectItem>
                          <SelectItem value="project_type">Project Type</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter description (optional)"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingClassification(null);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={createClassificationMutation.isPending || updateClassificationMutation.isPending}
                >
                  {editingClassification ? "Update Classification" : "Create Classification"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
