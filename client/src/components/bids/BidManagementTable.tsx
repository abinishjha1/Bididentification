import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
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
import { Eye, Edit } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import BidFormModal from "./BidFormModal";

type BidManagementTableProps = {
  limit?: number;
  showViewAll?: boolean;
  className?: string;
};

// Bid status badge styling
const statusStyles: Record<string, { bg: string; text: string }> = {
  'submitted': { bg: 'bg-blue-100', text: 'text-blue-800' },
  'under_review': { bg: 'bg-blue-100', text: 'text-blue-800' },
  'approved': { bg: 'bg-green-100', text: 'text-green-800' },
  'rejected': { bg: 'bg-red-100', text: 'text-red-800' },
  'contract_pending': { bg: 'bg-purple-100', text: 'text-purple-800' },
  'contract_signed': { bg: 'bg-green-100', text: 'text-green-800' },
  'withdrawn': { bg: 'bg-gray-100', text: 'text-gray-800' },
};

export default function BidManagementTable({ limit = 10, showViewAll = true, className }: BidManagementTableProps) {
  const [selectedBid, setSelectedBid] = useState<any | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const { data: bids, isLoading, error } = useQuery({
    queryKey: ['/api/bids'],
  });

  const displayBids = limit ? bids?.slice(0, limit) : bids;

  const handleViewBid = (bid: any) => {
    setSelectedBid(bid);
    setIsEditing(false);
  };

  const handleEditBid = (bid: any) => {
    setSelectedBid(bid);
    setIsEditing(true);
  };

  if (error) {
    return <div className="text-destructive">Error loading bid data</div>;
  }

  // Format currency
  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return 'N/A';
    return `$${amount.toLocaleString()}`;
  };

  return (
    <>
      <div className={className}>
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-neutral-100">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Active Bids</h3>
              {showViewAll && (
                <Button variant="link" className="text-primary-600">
                  <a href="/bids">View All</a>
                </Button>
              )}
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-neutral-50">
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Contractor</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Submission Date</TableHead>
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
                      <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                    </TableRow>
                  ))
                ) : displayBids?.length > 0 ? (
                  displayBids.map((bid: any) => (
                    <TableRow key={bid.id}>
                      <TableCell className="font-medium">{bid.project?.name || 'Unknown Project'}</TableCell>
                      <TableCell className="text-neutral-500">{bid.contractor?.name || 'Unknown Contractor'}</TableCell>
                      <TableCell className="text-neutral-500">{formatCurrency(bid.bid_amount)}</TableCell>
                      <TableCell className="text-neutral-500">
                        {format(new Date(bid.submission_date), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={`${statusStyles[bid.status]?.bg || 'bg-gray-100'} ${statusStyles[bid.status]?.text || 'text-gray-800'} border-none`}
                        >
                          {bid.status.split('_').map((word: string) => 
                            word.charAt(0).toUpperCase() + word.slice(1)
                          ).join(' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-primary-600 hover:text-primary-800"
                            onClick={() => handleViewBid(bid)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-primary-600 hover:text-primary-800"
                            onClick={() => handleEditBid(bid)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-neutral-500">
                      No bid records found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Bid Form Modal */}
      <BidFormModal 
        isOpen={!!selectedBid}
        onClose={() => setSelectedBid(null)}
        bid={selectedBid}
        isEditing={isEditing}
      />
    </>
  );
}
