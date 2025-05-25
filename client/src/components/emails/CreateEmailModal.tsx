import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const emailSchema = z.object({
  subject: z.string().min(3, "Subject must be at least 3 characters"),
  sender_email: z.string().email("Please enter a valid email address"),
  sender_name: z.string().optional(),
  recipient_email: z.string().email("Please enter a valid email address"),
  recipient_name: z.string().optional(),
  body_text: z.string().min(10, "Email body must be at least 10 characters"),
  email_type: z.enum(['general_inquiry', 'bid_submission', 'bid_inquiry', 'follow_up', 'contract_related', 'project_update', 'unknown']),
  // Use string for the form and convert to Date before submission
  received_date: z.string().default(() => new Date().toISOString().split('T')[0])
});

type EmailFormValues = z.infer<typeof emailSchema>;

type CreateEmailModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function CreateEmailModal({ isOpen, onClose }: CreateEmailModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const form = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      subject: "",
      sender_email: "",
      sender_name: "",
      recipient_email: "",
      recipient_name: "",
      body_text: "",
      email_type: "general_inquiry",
      received_date: new Date().toISOString().split('T')[0]
    }
  });

  const createEmailMutation = useMutation({
    mutationFn: async (data: EmailFormValues) => {
      return await apiRequest("POST", "/api/emails", data);
    },
    onSuccess: () => {
      toast({
        title: "Email Created",
        description: "Email has been successfully created and added to the system.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/emails'] });
      queryClient.invalidateQueries({ queryKey: ['/api/emails/unprocessed'] });
      form.reset();
      onClose();
    },
    onError: (error) => {
      console.error("Email creation error:", error);
      toast({
        title: "Error",
        description: "Failed to create email. Please try again.",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: EmailFormValues) => {
    setLoading(true);
    createEmailMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Email</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <FormControl>
                    <Input placeholder="Email subject" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sender_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sender Email</FormLabel>
                    <FormControl>
                      <Input placeholder="sender@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="sender_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sender Name (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="recipient_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recipient Email</FormLabel>
                    <FormControl>
                      <Input placeholder="recipient@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="recipient_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recipient Name (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Jane Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="email_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Type</FormLabel>
                  <Select 
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select email type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="general_inquiry">General Inquiry</SelectItem>
                      <SelectItem value="bid_submission">Bid Submission</SelectItem>
                      <SelectItem value="bid_inquiry">Bid Inquiry</SelectItem>
                      <SelectItem value="follow_up">Follow-up</SelectItem>
                      <SelectItem value="contract_related">Contract Related</SelectItem>
                      <SelectItem value="project_update">Project Update</SelectItem>
                      <SelectItem value="unknown">Unknown</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="received_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Received Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="body_text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Body</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter email content here..."
                      className="min-h-[200px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={loading || createEmailMutation.isPending}
              >
                {loading || createEmailMutation.isPending ? "Creating..." : "Create Email"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}