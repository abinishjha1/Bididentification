import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import EmailDetailModal from "./EmailDetailModal";

type EmailProcessingTableProps = {
  limit?: number;
  showViewAll?: boolean;
  className?: string;
};

// Email type badge styling
const emailTypeStyles: Record<string, { bg: string; text: string }> = {
  'bid_submission': { bg: 'bg-green-100', text: 'text-green-800' },
  'bid_inquiry': { bg: 'bg-blue-100', text: 'text-blue-800' },
  'follow_up': { bg: 'bg-purple-100', text: 'text-purple-800' },
  'contract_related': { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  'project_update': { bg: 'bg-indigo-100', text: 'text-indigo-800' },
  'unknown': { bg: 'bg-gray-100', text: 'text-gray-800' },
};

// Processing status badge styling
const statusStyles: Record<string, { bg: string; text: string }> = {
  'unprocessed': { bg: 'bg-red-100', text: 'text-red-800' },
  'processing': { bg: 'bg-blue-100', text: 'text-blue-800' },
  'processed': { bg: 'bg-green-100', text: 'text-green-800' },
  'failed': { bg: 'bg-red-100', text: 'text-red-800' },
  'needs_review': { bg: 'bg-yellow-100', text: 'text-yellow-800' },
};

export default function EmailProcessingTable({ limit = 10, showViewAll = true, className }: EmailProcessingTableProps) {
  const [selectedEmail, setSelectedEmail] = useState<any | null>(null);
  
  const { data: emails, isLoading, error } = useQuery({
    queryKey: ['/api/emails'],
  });

  const displayEmails = limit ? emails?.slice(0, limit) : emails;

  if (error) {
    return <div className="text-destructive">Error loading email data</div>;
  }

  return (
    <>
      <div className={className}>
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-neutral-100">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Recent Email Processing</h3>
              {showViewAll && (
                <Button variant="link" className="text-primary-600">
                  <a href="/emails">View All</a>
                </Button>
              )}
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-neutral-50">
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Sender</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  // Loading skeleton
                  Array(limit).fill(0).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-16" /></TableCell>
                    </TableRow>
                  ))
                ) : displayEmails?.length > 0 ? (
                  displayEmails.map((email: any) => (
                    <TableRow key={email.id}>
                      <TableCell className="font-medium">{email.subject}</TableCell>
                      <TableCell className="text-neutral-500">{email.sender_email}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={`${emailTypeStyles[email.email_type]?.bg || 'bg-gray-100'} ${emailTypeStyles[email.email_type]?.text || 'text-gray-800'} border-none`}
                        >
                          {email.email_type.split('_').map((word: string) => 
                            word.charAt(0).toUpperCase() + word.slice(1)
                          ).join(' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-neutral-500">
                        {format(new Date(email.received_date), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={`${statusStyles[email.processing_status]?.bg || 'bg-gray-100'} ${statusStyles[email.processing_status]?.text || 'text-gray-800'} border-none`}
                        >
                          {email.processing_status.split('_').map((word: string) => 
                            word.charAt(0).toUpperCase() + word.slice(1)
                          ).join(' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-primary-600 hover:text-primary-800"
                          onClick={() => setSelectedEmail(email)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-neutral-500">
                      No email records found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Email Detail Modal */}
      <EmailDetailModal 
        isOpen={!!selectedEmail} 
        onClose={() => setSelectedEmail(null)}
        email={selectedEmail}
      />
    </>
  );
}
