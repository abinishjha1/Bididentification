import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { CloudUpload } from "lucide-react";

type BidFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  bid?: any;
  isEditing?: boolean;
};

export default function BidFormModal({ isOpen, onClose, bid, isEditing = false }: BidFormModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<any>({
    project_id: "",
    contractor_id: "",
    bid_amount: "",
    submission_date: format(new Date(), "yyyy-MM-dd"),
    email_record_id: "",
    notes: "",
    status: "submitted",
    classifications: []
  });
  const [files, setFiles] = useState<File[]>([]);

  // Fetch projects and contractors for dropdowns
  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ['/api/projects/active'],
    enabled: isOpen,
  });

  const { data: contractors, isLoading: contractorsLoading } = useQuery({
    queryKey: ['/api/contractors'],
    enabled: isOpen,
  });

  const { data: emails, isLoading: emailsLoading } = useQuery({
    queryKey: ['/api/emails'],
    enabled: isOpen,
  });

  const { data: classifications, isLoading: classificationsLoading } = useQuery({
    queryKey: ['/api/classifications'],
    enabled: isOpen,
  });

  // Create and update mutations
  const createBidMutation = useMutation({
    mutationFn: async (bidData: any) => {
      const response = await apiRequest('POST', '/api/bids', bidData);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Bid has been created successfully.",
      });
      
      // Upload documents if there are any
      if (files.length > 0 && data.id) {
        uploadDocuments(data.id);
      } else {
        queryClient.invalidateQueries({ queryKey: ['/api/bids'] });
        queryClient.invalidateQueries({ queryKey: ['/api/dashboard/summary'] });
        onClose();
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create bid. Please try again.",
        variant: "destructive",
      });
      console.error('Bid creation error:', error);
    }
  });

  const updateBidMutation = useMutation({
    mutationFn: async (bidData: any) => {
      const { id, ...data } = bidData;
      const response = await apiRequest('PATCH', `/api/bids/${id}`, data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Bid has been updated successfully.",
      });
      
      // Upload documents if there are any
      if (files.length > 0 && data.id) {
        uploadDocuments(data.id);
      } else {
        queryClient.invalidateQueries({ queryKey: ['/api/bids'] });
        queryClient.invalidateQueries({ queryKey: ['/api/dashboard/summary'] });
        onClose();
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update bid. Please try again.",
        variant: "destructive",
      });
      console.error('Bid update error:', error);
    }
  });

  // Upload documents function
  const uploadDocuments = async (bidId: string) => {
    let allSuccess = true;
    
    for (const file of files) {
      try {
        // In a real implementation, this would use FormData and a file upload endpoint
        // For this example, we'll just simulate by storing the file name and a placeholder URL
        const documentData = {
          bid_id: bidId,
          document_name: file.name,
          document_url: `https://storage.example.com/${bidId}/${file.name}`,
          document_type: file.type
        };
        
        await apiRequest('POST', '/api/bid-documents', documentData);
      } catch (error) {
        console.error('Document upload error:', error);
        allSuccess = false;
      }
    }
    
    if (!allSuccess) {
      toast({
        title: "Warning",
        description: "Bid was saved but some documents failed to upload.",
        variant: "destructive",
      });
    } else if (files.length > 0) {
      toast({
        title: "Success",
        description: `${files.length} document(s) uploaded successfully.`,
      });
    }
    
    queryClient.invalidateQueries({ queryKey: ['/api/bids'] });
    queryClient.invalidateQueries({ queryKey: ['/api/dashboard/summary'] });
    onClose();
  };

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleClassificationToggle = (classificationId: string) => {
    const currentClassifications = [...formData.classifications];
    
    if (currentClassifications.includes(classificationId)) {
      // Remove the classification
      setFormData({
        ...formData, 
        classifications: currentClassifications.filter(id => id !== classificationId)
      });
    } else {
      // Add the classification
      setFormData({
        ...formData, 
        classifications: [...currentClassifications, classificationId]
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles([...files, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Format data for submission
    const bidData = {
      ...formData,
      bid_amount: formData.bid_amount ? parseFloat(formData.bid_amount) : null,
    };
    
    if (isEditing && bid) {
      updateBidMutation.mutate({ ...bidData, id: bid.id });
    } else {
      createBidMutation.mutate(bidData);
    }
  };

  // Initialize form with bid data if editing
  useEffect(() => {
    if (isOpen && bid && isEditing) {
      setFormData({
        project_id: bid.project_id || "",
        contractor_id: bid.contractor_id || "",
        bid_amount: bid.bid_amount ? bid.bid_amount.toString() : "",
        submission_date: bid.submission_date ? format(new Date(bid.submission_date), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
        email_record_id: bid.email_record_id || "",
        notes: bid.notes || "",
        status: bid.status || "submitted",
        classifications: bid.classifications?.map((c: any) => c.classification_id) || []
      });
    } else if (isOpen && !isEditing) {
      // Reset form when opening for new bid
      setFormData({
        project_id: "",
        contractor_id: "",
        bid_amount: "",
        submission_date: format(new Date(), "yyyy-MM-dd"),
        email_record_id: "",
        notes: "",
        status: "submitted",
        classifications: []
      });
      setFiles([]);
    }
  }, [isOpen, bid, isEditing]);

  if (!isOpen) return null;

  // Filter classifications by category
  const getClassificationsByCategory = (category: string) => {
    return classifications?.filter(c => c.category === category) || [];
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Bid" : "Add New Bid"}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <Label htmlFor="project_id">Project</Label>
              <Select
                value={formData.project_id}
                onValueChange={(value) => handleSelectChange("project_id", value)}
              >
                <SelectTrigger id="project_id" className="w-full">
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projectsLoading ? (
                    <SelectItem value="loading">Loading projects...</SelectItem>
                  ) : projects?.length > 0 ? (
                    projects.map((project: any) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none">No projects available</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="contractor_id">Contractor</Label>
              <Select
                value={formData.contractor_id}
                onValueChange={(value) => handleSelectChange("contractor_id", value)}
              >
                <SelectTrigger id="contractor_id" className="w-full">
                  <SelectValue placeholder="Select a contractor" />
                </SelectTrigger>
                <SelectContent>
                  {contractorsLoading ? (
                    <SelectItem value="loading">Loading contractors...</SelectItem>
                  ) : contractors?.length > 0 ? (
                    contractors.map((contractor: any) => (
                      <SelectItem key={contractor.id} value={contractor.id}>
                        {contractor.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none">No contractors available</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="bid_amount">Bid Amount</Label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-500">$</span>
                <Input
                  id="bid_amount"
                  name="bid_amount"
                  value={formData.bid_amount}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="pl-8"
                  type="number"
                  step="0.01"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="submission_date">Submission Date</Label>
              <Input
                id="submission_date"
                name="submission_date"
                type="date"
                value={formData.submission_date}
                onChange={handleChange}
              />
            </div>
            
            <div className="md:col-span-2">
              <Label htmlFor="email_record_id">Email Reference</Label>
              <Select
                value={formData.email_record_id}
                onValueChange={(value) => handleSelectChange("email_record_id", value)}
              >
                <SelectTrigger id="email_record_id" className="w-full">
                  <SelectValue placeholder="Select an email (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {emailsLoading ? (
                    <SelectItem value="loading">Loading emails...</SelectItem>
                  ) : emails?.length > 0 ? (
                    emails.map((email: any) => (
                      <SelectItem key={email.id} value={email.id}>
                        {email.subject}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-emails">No emails available</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="md:col-span-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleSelectChange("status", value)}
              >
                <SelectTrigger id="status" className="w-full">
                  <SelectValue placeholder="Select bid status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="contract_pending">Contract Pending</SelectItem>
                  <SelectItem value="contract_signed">Contract Signed</SelectItem>
                  <SelectItem value="withdrawn">Withdrawn</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="md:col-span-2">
              <Label>Classification</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                {classificationsLoading ? (
                  <p>Loading classifications...</p>
                ) : (
                  <>
                    {/* Value Range Classifications */}
                    {getClassificationsByCategory('value_range').map((classification: any) => (
                      <div key={classification.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`classification-${classification.id}`}
                          checked={formData.classifications.includes(classification.id)}
                          onCheckedChange={() => handleClassificationToggle(classification.id)}
                        />
                        <label 
                          htmlFor={`classification-${classification.id}`}
                          className="text-sm text-neutral-700 cursor-pointer"
                        >
                          {classification.name}
                        </label>
                      </div>
                    ))}
                    
                    {/* Project Type Classifications */}
                    {getClassificationsByCategory('project_type').map((classification: any) => (
                      <div key={classification.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`classification-${classification.id}`}
                          checked={formData.classifications.includes(classification.id)}
                          onCheckedChange={() => handleClassificationToggle(classification.id)}
                        />
                        <label 
                          htmlFor={`classification-${classification.id}`}
                          className="text-sm text-neutral-700 cursor-pointer"
                        >
                          {classification.name}
                        </label>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
            
            <div className="md:col-span-2">
              <Label>Documents</Label>
              <div className="border border-dashed border-neutral-300 rounded-md p-6 flex flex-col items-center justify-center mt-1">
                <CloudUpload className="text-neutral-400 h-8 w-8 mb-2" />
                <p className="text-sm text-neutral-500 mb-2">Drag and drop files here, or click to select files</p>
                <p className="text-xs text-neutral-400">PDF, DOCX, XLSX up to 10MB each</p>
                <div className="relative mt-4">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    multiple
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Button type="button" variant="default" size="sm">
                    Select Files
                  </Button>
                </div>
              </div>
              
              {/* Selected files list */}
              {files.length > 0 && (
                <div className="mt-3 space-y-2">
                  <Label>Selected Files:</Label>
                  <ul className="text-sm space-y-1">
                    {files.map((file, index) => (
                      <li key={index} className="flex justify-between items-center">
                        <span>{file.name} ({(file.size / 1024).toFixed(0)} KB)</span>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removeFile(index)}
                          className="h-6 w-6 p-0 text-destructive"
                        >
                          &times;
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <div className="md:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                placeholder="Add any additional notes about this bid..."
              />
            </div>
          </div>
          
          <DialogFooter className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createBidMutation.isPending || updateBidMutation.isPending}
              className="bg-primary-600 text-white hover:bg-primary-700"
            >
              {isEditing ? "Update Bid" : "Save Bid"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
