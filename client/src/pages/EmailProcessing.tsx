import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Upload, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EmailProcessingTable from "@/components/emails/EmailProcessingTable";
import CreateEmailModal from "@/components/emails/CreateEmailModal";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function EmailProcessing() {
  const { toast } = useToast();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { data: unprocessedEmails, isLoading: unprocessedLoading, refetch: refetchUnprocessed } = useQuery({
    queryKey: ['/api/emails/unprocessed'],
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetchUnprocessed();
      toast({
        title: "Refreshed",
        description: "Email list has been refreshed successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh emails. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleEmailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    
    // Simple validation
    if (!file.name.endsWith('.eml') && !file.name.endsWith('.msg')) {
      toast({
        title: "Invalid file",
        description: "Please upload a valid email file (.eml or .msg)",
        variant: "destructive",
      });
      return;
    }
    
    // In a real application, this would use FormData to upload the file
    // For this demonstration, we'll simulate by creating a sample email record
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const emailText = event.target?.result as string;
        const lines = emailText.split('\n');
        let subject = file.name;
        let sender = 'example@example.com';
        
        // Extract basic info from email content (simplified example)
        for (const line of lines.slice(0, 20)) {
          if (line.startsWith('Subject:')) subject = line.substring(8).trim();
          if (line.startsWith('From:')) sender = line.substring(5).trim();
        }
        
        // Create email record through API
        const emailData = {
          subject: subject,
          sender_email: sender,
          sender_name: sender.split('<')[0].trim(),
          recipient_email: 'procurement@company.com',
          received_date: new Date().toISOString(),
          body_text: emailText.substring(0, 1000), // First 1000 chars for demo
          email_type: 'unknown',
          is_processed: false,
          processing_status: 'unprocessed'
        };
        
        await apiRequest('POST', '/api/emails', emailData);
        
        toast({
          title: "Email Uploaded",
          description: "Email has been uploaded and is ready for processing.",
        });
        
        refetchUnprocessed();
      } catch (error) {
        console.error(error);
        toast({
          title: "Upload Failed",
          description: "There was an error uploading the email. Please try again.",
          variant: "destructive",
        });
      }
    };
    
    reader.readAsText(file);
    
    // Reset file input
    e.target.value = '';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Email Processing</h1>
        <div className="flex gap-2">
          <div className="relative">
            <input
              type="file"
              accept=".eml,.msg"
              id="email-upload"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleEmailUpload}
            />
            <Button variant="outline" className="flex items-center gap-2">
              <Upload size={16} />
              <span>Upload Email</span>
            </Button>
          </div>
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
            <span>Refresh</span>
          </Button>
          <Button className="flex items-center gap-2" onClick={() => setIsCreateModalOpen(true)}>
            <Plus size={16} />
            <span>New Email</span>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Email Management</CardTitle>
          <CardDescription>
            Process, classify, and manage all incoming email communications.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Emails</TabsTrigger>
              <TabsTrigger value="unprocessed">
                Unprocessed {unprocessedEmails?.length > 0 && `(${unprocessedEmails.length})`}
              </TabsTrigger>
              <TabsTrigger value="processed">Processed</TabsTrigger>
              <TabsTrigger value="needs-review">Needs Review</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              <EmailProcessingTable showViewAll={false} />
            </TabsContent>
            
            <TabsContent value="unprocessed">
              {unprocessedLoading ? (
                <div className="text-center py-8">Loading unprocessed emails...</div>
              ) : unprocessedEmails?.length > 0 ? (
                <EmailProcessingTable showViewAll={false} />
              ) : (
                <div className="text-center py-8 text-neutral-500">
                  No unprocessed emails found. All emails have been processed.
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="processed">
              <div className="text-center py-8 text-neutral-500">
                This tab would show processed emails. Filter implementation would be added here.
              </div>
            </TabsContent>
            
            <TabsContent value="needs-review">
              <div className="text-center py-8 text-neutral-500">
                This tab would show emails that need manual review. Filter implementation would be added here.
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Create Email Modal */}
      <CreateEmailModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}
