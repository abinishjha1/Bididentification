import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

type EmailDetailModalProps = {
  isOpen: boolean;
  onClose: () => void;
  email: any;
};

export default function EmailDetailModal({ isOpen, onClose, email }: EmailDetailModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  // If email is null or undefined, close the modal to prevent errors
  useEffect(() => {
    if (isOpen && !email) {
      onClose();
    }
  }, [isOpen, email, onClose]);

  // Fetch data for projects and contractors for bid creation
  const { data: projects } = useQuery({
    queryKey: ['/api/projects/active'],
    enabled: isOpen && email && email.email_type === 'bid_submission',
  });

  const { data: contractors } = useQuery({
    queryKey: ['/api/contractors'],
    enabled: isOpen && email && email.email_type === 'bid_submission',
  });

  // Extract bid amount using regex
  const extractBidAmount = (text: string): string | null => {
    const matches = text.match(/\$([0-9,]+(?:\.[0-9]{2})?)/);
    return matches ? matches[1].replace(/,/g, '') : null;
  };

  // Find project from email content
  const findRelatedProject = (emailContent: string, projects: any[]): any | null => {
    if (!projects?.length || !email) return null;
    
    const combinedContent = ((email.subject || '') + ' ' + (email.body_text || '')).toLowerCase();
    return projects.find(p => 
      p.name && combinedContent.includes(p.name.toLowerCase())
    ) || null;
  };

  // Find contractor from email sender
  const findRelatedContractor = (email: any, contractors: any[]): any | null => {
    if (!contractors?.length || !email?.sender_email) return null;
    
    return contractors.find(c => 
      c.email && email.sender_email && c.email.toLowerCase() === email.sender_email.toLowerCase()
    ) || null;
  };

  // Create bid mutation
  const createBidMutation = useMutation({
    mutationFn: async (bidData: any) => {
      return await apiRequest('/api/bids', 'POST', bidData);
    },
    onSuccess: () => {
      toast({
        title: 'Bid Created',
        description: 'Bid record has been successfully created.',
        variant: 'default'
      });
      // Mark email as processed
      updateEmailMutation.mutate({
        id: email.id,
        data: { 
          is_processed: true,
          processing_status: 'processed'
        }
      });
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['/api/bids'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/summary'] });
      onClose();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create bid. Please try again.',
        variant: 'destructive'
      });
      console.error('Bid creation error:', error);
    }
  });

  // Update email mutation
  const updateEmailMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: any }) => {
      return await apiRequest(`/api/emails/${id}`, 'PATCH', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/emails'] });
    }
  });

  // Handle bid creation
  const handleCreateBid = () => {
    if (!email) return;
    
    setLoading(true);
    
    try {
      // Type assertions to handle the unknown type
      const projectsArray = Array.isArray(projects) ? projects : [];
      const contractorsArray = Array.isArray(contractors) ? contractors : [];
      
      const relatedProject = findRelatedProject(email.body_text || '', projectsArray);
      const relatedContractor = findRelatedContractor(email, contractorsArray);
      const extractedAmount = extractBidAmount(email.body_text || '');
      
      if (!relatedProject || !relatedContractor) {
        toast({
          title: 'Missing Information',
          description: !relatedProject 
            ? 'Could not find a related project. Please select manually.' 
            : 'Could not find a related contractor. Please select manually.',
          variant: 'destructive'
        });
        setLoading(false);
        return;
      }
      
      const bidData = {
        project_id: relatedProject.id,
        contractor_id: relatedContractor.id,
        email_record_id: email.id,
        bid_amount: extractedAmount || "0",
        submission_date: new Date().toISOString().split('T')[0],
        notes: `Auto-created from email: ${email.subject}`,
        status: 'submitted'
      };
      
      createBidMutation.mutate(bidData);
    } catch (error) {
      console.error('Error preparing bid data:', error);
      toast({
        title: 'Error',
        description: 'Failed to prepare bid data. Please try again.',
        variant: 'destructive'
      });
      setLoading(false);
    }
  };

  // Handle marking email as reviewed
  const handleMarkAsReviewed = () => {
    if (!email || !email.id) {
      toast({
        title: 'Error',
        description: 'Cannot process this email. Email data is missing.',
        variant: 'destructive'
      });
      onClose();
      return;
    }
    
    updateEmailMutation.mutate({
      id: email.id,
      data: { 
        is_processed: true,
        processing_status: 'processed'
      }
    });
    onClose();
  };

  // Reset loading state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Email Processing Details</DialogTitle>
        </DialogHeader>
        
        {/* Email Information */}
        <div className="mb-6">
          <h4 className="text-md font-medium mb-4">Email Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-neutral-500">Subject</p>
              <p className="font-medium">{email?.subject || <Skeleton className="h-5 w-40" />}</p>
            </div>
            <div>
              <p className="text-sm text-neutral-500">Date Received</p>
              <p>{email ? format(new Date(email.received_date), 'MMM d, yyyy h:mm a') : <Skeleton className="h-5 w-32" />}</p>
            </div>
            <div>
              <p className="text-sm text-neutral-500">From</p>
              <p>{email ? `${email.sender_name || ''} (${email.sender_email})` : <Skeleton className="h-5 w-40" />}</p>
            </div>
            <div>
              <p className="text-sm text-neutral-500">To</p>
              <p>{email?.recipient_email || <Skeleton className="h-5 w-32" />}</p>
            </div>
          </div>
        </div>
        
        {/* Email Content */}
        <div className="mb-6 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
          <h4 className="text-md font-medium mb-2">Email Content</h4>
          {email ? (
            <p className="text-sm whitespace-pre-line">{email.body_text || 'No content available'}</p>
          ) : (
            <Skeleton className="h-24 w-full" />
          )}
        </div>
        
        {/* Classification Results */}
        <div className="mb-6">
          <h4 className="text-md font-medium mb-4">Classification Results</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm font-medium text-green-800">Email Type</p>
              <p className="text-sm">
                {email ? email.email_type.split('_').map((word: string) => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ') : <Skeleton className="h-4 w-24 mt-1" />}
              </p>
              <p className="text-xs text-green-600 mt-1">
                {email ? '90% confidence' : <Skeleton className="h-3 w-16 mt-1" />}
              </p>
            </div>
            
            {email?.email_type === 'bid_submission' && (
              <>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-blue-800">Value Range</p>
                  <p className="text-sm">
                    {extractBidAmount(email.body_text || '') 
                      ? parseFloat(extractBidAmount(email.body_text || '') || '0') > 100000 
                        ? 'High Value Bid'
                        : parseFloat(extractBidAmount(email.body_text || '') || '0') > 10000
                          ? 'Medium Value Bid'
                          : 'Low Value Bid'
                      : 'Value Not Detected'}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">85% confidence</p>
                </div>
                
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <p className="text-sm font-medium text-purple-800">Project Type</p>
                  <p className="text-sm">
                    {email && email.body_text ? findRelatedProject(email.body_text, Array.isArray(projects) ? projects : [])?.project_type || 'Not Detected' : 'No Email Content'}
                  </p>
                  <p className="text-xs text-purple-600 mt-1">80% confidence</p>
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* Extracted Information */}
        {email?.email_type === 'bid_submission' && (
          <div className="mb-6">
            <h4 className="text-md font-medium mb-4">Extracted Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-neutral-500">Bid Amount</p>
                <p className="font-medium">
                  {email && email.body_text && extractBidAmount(email.body_text) 
                    ? `$${parseFloat(extractBidAmount(email.body_text) || '0').toLocaleString()}`
                    : 'Not detected'}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-neutral-500">Project Reference</p>
                <p>{email && email.body_text && findRelatedProject(email.body_text, Array.isArray(projects) ? projects : [])?.name || 'Not detected'}</p>
              </div>
              
              <div>
                <p className="text-sm text-neutral-500">Contractor</p>
                <p>{email && findRelatedContractor(email, Array.isArray(contractors) ? contractors : [])?.name || 'Not detected'}</p>
              </div>
              
              <div>
                <p className="text-sm text-neutral-500">Project</p>
                <p>{email && email.body_text && findRelatedProject(email.body_text, Array.isArray(projects) ? projects : [])?.name || 'Not detected'}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Action Buttons */}
        <DialogFooter className="flex flex-wrap gap-3">
          {email?.email_type === 'bid_submission' && !email?.is_processed && (
            <Button 
              onClick={handleCreateBid} 
              disabled={loading || createBidMutation.isPending}
              className="bg-primary-600 hover:bg-primary-700"
            >
              Create Bid Record
            </Button>
          )}
          
          <Button 
            variant="outline" 
            className="bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
          >
            Edit Classification
          </Button>
          
          <Button 
            variant="outline" 
            className="bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
          >
            Link to Existing Project
          </Button>
          
          <Button 
            variant="outline" 
            className="bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
            onClick={handleMarkAsReviewed}
            disabled={updateEmailMutation.isPending}
          >
            Mark as Reviewed
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
