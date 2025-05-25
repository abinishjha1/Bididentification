import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Search, Edit, Trash2, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

const contractorSchema = z.object({
  name: z.string().min(1, "Contractor name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  certification_level: z.string().optional(),
});

type ContractorFormValues = z.infer<typeof contractorSchema>;

export default function Contractors() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingContractor, setEditingContractor] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Fetch contractors
  const { data: contractors, isLoading } = useQuery({
    queryKey: ['/api/contractors'],
  });

  // Create contractor mutation
  const createContractorMutation = useMutation({
    mutationFn: async (data: ContractorFormValues) => {
      const response = await apiRequest('POST', '/api/contractors', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Contractor has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/contractors'] });
      setIsAddModalOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create contractor. Please try again.",
        variant: "destructive",
      });
      console.error('Contractor creation error:', error);
    }
  });

  // Update contractor mutation
  const updateContractorMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: ContractorFormValues }) => {
      const response = await apiRequest('PATCH', `/api/contractors/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Contractor has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/contractors'] });
      setEditingContractor(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update contractor. Please try again.",
        variant: "destructive",
      });
      console.error('Contractor update error:', error);
    }
  });

  // Delete contractor mutation
  const deleteContractorMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('DELETE', `/api/contractors/${id}`, undefined);
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Contractor has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/contractors'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete contractor. Please try again.",
        variant: "destructive",
      });
      console.error('Contractor deletion error:', error);
    }
  });

  // Form handling
  const form = useForm<ContractorFormValues>({
    resolver: zodResolver(contractorSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      certification_level: "",
    },
  });

  // Reset form when opening the add modal
  const handleOpenAddModal = () => {
    form.reset({
      name: "",
      email: "",
      phone: "",
      certification_level: "",
    });
    setIsAddModalOpen(true);
  };

  // Set form values when editing a contractor
  const handleEditContractor = (contractor: any) => {
    form.reset({
      name: contractor.name,
      email: contractor.email,
      phone: contractor.phone || "",
      certification_level: contractor.certification_level || "",
    });
    setEditingContractor(contractor);
  };

  // Handle form submission
  const onSubmit = (data: ContractorFormValues) => {
    if (editingContractor) {
      updateContractorMutation.mutate({ id: editingContractor.id, data });
    } else {
      createContractorMutation.mutate(data);
    }
  };

  // Filter contractors based on search
  const filteredContractors = contractors?.filter((contractor: any) => 
    contractor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contractor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (contractor.phone && contractor.phone.includes(searchQuery)) ||
    (contractor.certification_level && contractor.certification_level.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Get initials from contractor name
  const getInitials = (name: string): string => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Contractor Management</h1>
        <Button className="flex items-center gap-2" onClick={handleOpenAddModal}>
          <Plus size={16} />
          <span>New Contractor</span>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Contractors</CardTitle>
              <CardDescription>
                Manage all contractors who submit bids for your projects.
              </CardDescription>
            </div>
            <div className="w-full sm:w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={16} />
                <Input
                  placeholder="Search contractors..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading contractors...</div>
          ) : filteredContractors?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredContractors.map((contractor: any) => (
                <Card key={contractor.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 bg-neutral-200">
                        <AvatarFallback className="text-neutral-600 font-medium">
                          {getInitials(contractor.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{contractor.name}</CardTitle>
                        <CardDescription>
                          {contractor.certification_level || "No certification"}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail size={14} className="text-neutral-500" />
                        <a href={`mailto:${contractor.email}`} className="text-primary-600 hover:underline">
                          {contractor.email}
                        </a>
                      </div>
                      {contractor.phone && (
                        <div className="flex items-center gap-2">
                          <Phone size={14} className="text-neutral-500" />
                          <a href={`tel:${contractor.phone}`} className="hover:underline">
                            {contractor.phone}
                          </a>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2 pt-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-8 px-2"
                      onClick={() => handleEditContractor(contractor)}
                    >
                      <Edit size={16} className="mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-8 px-2 text-destructive hover:text-destructive"
                      onClick={() => {
                        if (confirm("Are you sure you want to delete this contractor?")) {
                          deleteContractorMutation.mutate(contractor.id);
                        }
                      }}
                    >
                      <Trash2 size={16} className="mr-1" />
                      Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-neutral-500">
              No contractors found. {searchQuery && "Try adjusting your search criteria."}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contractor Form Modal */}
      <Dialog 
        open={isAddModalOpen || !!editingContractor} 
        onOpenChange={(open) => {
          if (!open) {
            setIsAddModalOpen(false);
            setEditingContractor(null);
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingContractor ? "Edit Contractor" : "Add New Contractor"}</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contractor Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter contractor name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Enter email address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter phone number (optional)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="certification_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Certification Level</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Certified General Contractor" {...field} />
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
                    setEditingContractor(null);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={createContractorMutation.isPending || updateContractorMutation.isPending}
                >
                  {editingContractor ? "Update Contractor" : "Create Contractor"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
