import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BidManagementTable from "@/components/bids/BidManagementTable";
import BidFormModal from "@/components/bids/BidFormModal";

export default function Bids() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Fetch bid data and related data
  const { data: bids, isLoading } = useQuery({
    queryKey: ['/api/bids'],
  });

  // Filtered bids based on search and status filter
  const filteredBids = bids?.filter((bid: any) => {
    const matchesSearch = searchQuery === "" || 
      (bid.project?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       bid.contractor?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       (bid.bid_amount && bid.bid_amount.toString().includes(searchQuery)) ||
       (bid.notes && bid.notes.toLowerCase().includes(searchQuery.toLowerCase())));
       
    const matchesStatus = statusFilter === "all" || bid.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Get counts for each status
  const getStatusCount = (status: string) => {
    if (!bids) return 0;
    return status === "all" 
      ? bids.length 
      : bids.filter((bid: any) => bid.status === status).length;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Bid Management</h1>
        <Button className="flex items-center gap-2" onClick={() => setIsAddModalOpen(true)}>
          <Plus size={16} />
          <span>New Bid</span>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bids</CardTitle>
          <CardDescription>
            Manage all contractor bids for your projects. Track status, review details, and process approvals.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={16} />
              <Input
                placeholder="Search bids..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-neutral-400" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses ({getStatusCount("all")})</SelectItem>
                  <SelectItem value="submitted">Submitted ({getStatusCount("submitted")})</SelectItem>
                  <SelectItem value="under_review">Under Review ({getStatusCount("under_review")})</SelectItem>
                  <SelectItem value="approved">Approved ({getStatusCount("approved")})</SelectItem>
                  <SelectItem value="rejected">Rejected ({getStatusCount("rejected")})</SelectItem>
                  <SelectItem value="contract_pending">Contract Pending ({getStatusCount("contract_pending")})</SelectItem>
                  <SelectItem value="contract_signed">Contract Signed ({getStatusCount("contract_signed")})</SelectItem>
                  <SelectItem value="withdrawn">Withdrawn ({getStatusCount("withdrawn")})</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Bids</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="contracts">With Contracts</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              {isLoading ? (
                <div className="text-center py-8">Loading bids...</div>
              ) : filteredBids?.length > 0 ? (
                <BidManagementTable showViewAll={false} />
              ) : (
                <div className="text-center py-8 text-neutral-500">
                  No bids found. {searchQuery && "Try adjusting your search criteria."}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="active">
              <div className="text-center py-8 text-neutral-500">
                This tab would show active bids (submitted, under review). Filter implementation would be added here.
              </div>
            </TabsContent>
            
            <TabsContent value="approved">
              <div className="text-center py-8 text-neutral-500">
                This tab would show approved bids. Filter implementation would be added here.
              </div>
            </TabsContent>
            
            <TabsContent value="contracts">
              <div className="text-center py-8 text-neutral-500">
                This tab would show bids with associated contracts. Filter implementation would be added here.
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Add Bid Modal */}
      <BidFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}
