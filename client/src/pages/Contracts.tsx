import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Search, Eye, Download, FileText } from "lucide-react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

const contractSchema = z.object({
  bid_id: z.string().min(1, "Bid is required"),
  contract_number: z.string().optional(),
  contract_amount: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  status: z.string().min(1, "Status is required"),
});

type ContractFormValues = z.infer<typeof contractSchema>;

export default function Contracts() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewingContract, setViewingContract] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Fetch contracts and bids
  const { data: contracts, isLoading } = useQuery({
    queryKey: ['/api/contracts'],
  });
  
  const { data: bids } = useQuery({
    queryKey: ['/api/bids'],
    enabled: isAddModalOpen,
  });

  // Create contract mutation
  const createContractMutation = useMutation({
    mutationFn: async (data: any) => {
      // Convert contract_amount to number if provided
      if (data.contract_amount) {
        data.contract_amount = parseFloat(data.contract_amount);
      }
      
      const response = await apiRequest('POST', '/api/contracts', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Contract has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/contracts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/bids'] });
      setIsAddModalOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create contract. Please try again.",
        variant: "destructive",
      });
      console.error('Contract creation error:', error);
    }
  });

  // Form handling
  const form = useForm<ContractFormValues>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      bid_id: "",
      contract_number: "",
      contract_amount: "",
      start_date: format(new Date(), "yyyy-MM-dd"),
      end_date: "",
      status: "draft",
    },
  });

  // Reset form when opening the add modal
  const handleOpenAddModal = () => {
    form.reset({
      bid_id: "",
      contract_number: "",
      contract_amount: "",
      start_date: format(new Date(), "yyyy-MM-dd"),
      end_date: "",
      status: "draft",
    });
    setIsAddModalOpen(true);
  };

  // Handle form submission
  const onSubmit = (data: ContractFormValues) => {
    createContractMutation.mutate(data);
  };

  // Filter contracts based on search
  const filteredContracts = contracts?.filter((contract: any) => {
    // Get bid details if available
    const bid = bids?.find((b: any) => b.id === contract.bid_id);
    
    return (
      (contract.contract_number && contract.contract_number.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (bid?.project?.name && bid.project.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (bid?.contractor?.name && bid.contractor.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (contract.status && contract.status.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  // Format currency
  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return 'N/A';
    return `$${amount.toLocaleString()}`;
  };

  // Status badge style
  const getStatusBadgeStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'signed':
        return 'bg-green-100 text-green-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-yellow-100 text-yellow-800';
      case 'terminated':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Contract Management</h1>
        <Button className="flex items-center gap-2" onClick={handleOpenAddModal}>
          <Plus size={16} />
          <span>New Contract</span>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Contracts</CardTitle>
              <CardDescription>
                Manage all contracts associated with approved bids.
              </CardDescription>
            </div>
            <div className="w-full sm:w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={16} />
                <Input
                  placeholder="Search contracts..."
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
            <div className="text-center py-8">Loading contracts...</div>
          ) : filteredContracts?.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contract Number</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Contractor</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContracts.map((contract: any) => {
                    // Find related bid to get project and contractor info
                    const bid = bids?.find((b: any) => b.id === contract.bid_id);
                    
                    return (
                      <TableRow key={contract.id}>
                        <TableCell className="font-medium">
                          {contract.contract_number || "Draft"}
                        </TableCell>
                        <TableCell>
                          {bid?.project?.name || "Unknown Project"}
                        </TableCell>
                        <TableCell>
                          {bid?.contractor?.name || "Unknown Contractor"}
                        </TableCell>
                        <TableCell>
                          {formatCurrency(contract.contract_amount)}
                        </TableCell>
                        <TableCell>
                          {contract.start_date ? format(new Date(contract.start_date), "MMM d, yyyy") : "N/A"}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusBadgeStyle(contract.status)}>
                            {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0"
                              onClick={() => setViewingContract(contract)}
                            >
                              <Eye size={16} />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0"
                            >
                              <Download size={16} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-neutral-500">
              No contracts found. {searchQuery && "Try adjusting your search criteria."}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contract Form Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={(open) => !open && setIsAddModalOpen(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Contract</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="bid_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Associated Bid</FormLabel>
                    <FormControl>
                      <Select 
                        value={field.value} 
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a bid" />
                        </SelectTrigger>
                        <SelectContent>
                          {isLoading ? (
                            <SelectItem value="loading">Loading bids...</SelectItem>
                          ) : bids && bids.filter((bid: any) => 
                              bid.status === 'approved' || bid.status === 'under_review'
                            ).length > 0 ? (
                            bids.filter((bid: any) => 
                              bid.status === 'approved' || bid.status === 'under_review'
                            ).map((bid: any) => (
                              <SelectItem key={bid.id} value={bid.id}>
                                {bid.project?.name || 'Unknown Project'} - {bid.contractor?.name || 'Unknown Contractor'}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="none">No eligible bids available</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="contract_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contract Number</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. CTR-2024-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="contract_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contract Amount</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-500">$</span>
                        <Input
                          placeholder="0.00"
                          className="pl-8"
                          type="number"
                          step="0.01"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="start_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="end_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                      <Select 
                        value={field.value} 
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="sent">Sent</SelectItem>
                          <SelectItem value="signed">Signed</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="expired">Expired</SelectItem>
                          <SelectItem value="terminated">Terminated</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={createContractMutation.isPending}
                >
                  Create Contract
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Contract View Modal */}
      <Dialog open={!!viewingContract} onOpenChange={(open) => !open && setViewingContract(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Contract Details</DialogTitle>
          </DialogHeader>
          
          {viewingContract && (
            <div className="space-y-6">
              <div className="bg-neutral-50 p-6 rounded-lg border border-neutral-200">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <FileText size={24} className="text-primary-600" />
                    <h2 className="text-xl font-semibold">
                      {viewingContract.contract_number || "Draft Contract"}
                    </h2>
                  </div>
                  <Badge className={getStatusBadgeStyle(viewingContract.status)}>
                    {viewingContract.status.charAt(0).toUpperCase() + viewingContract.status.slice(1)}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                  <div>
                    <h3 className="text-sm font-medium text-neutral-500">Project</h3>
                    <p className="mt-1">
                      {bids?.find((b: any) => b.id === viewingContract.bid_id)?.project?.name || "Unknown Project"}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-neutral-500">Contractor</h3>
                    <p className="mt-1">
                      {bids?.find((b: any) => b.id === viewingContract.bid_id)?.contractor?.name || "Unknown Contractor"}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-neutral-500">Contract Amount</h3>
                    <p className="mt-1 text-lg font-semibold">
                      {formatCurrency(viewingContract.contract_amount)}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-neutral-500">Contract Dates</h3>
                    <p className="mt-1">
                      {viewingContract.start_date ? format(new Date(viewingContract.start_date), "MMM d, yyyy") : "N/A"}
                      {viewingContract.end_date ? ` to ${format(new Date(viewingContract.end_date), "MMM d, yyyy")}` : ""}
                    </p>
                  </div>
                  
                  <div className="md:col-span-2">
                    <h3 className="text-sm font-medium text-neutral-500">Associated Bid</h3>
                    <p className="mt-1">
                      {bids?.find((b: any) => b.id === viewingContract.bid_id)?.bid_amount 
                        ? `$${bids?.find((b: any) => b.id === viewingContract.bid_id)?.bid_amount.toLocaleString()}`
                        : "N/A"}
                      {" (Submitted on "}
                      {bids?.find((b: any) => b.id === viewingContract.bid_id)?.submission_date
                        ? format(new Date(bids?.find((b: any) => b.id === viewingContract.bid_id)?.submission_date), "MMM d, yyyy")
                        : "unknown date"}
                      {")"}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="text-center py-6 border-t border-neutral-200">
                <p className="text-neutral-500 mb-4">Contract document preview would appear here</p>
                <Button className="mr-2">
                  <Download size={16} className="mr-2" />
                  Download Contract
                </Button>
                <Button variant="outline">
                  Send for Signature
                </Button>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setViewingContract(null)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
