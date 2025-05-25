import DashboardSummary from "@/components/dashboard/DashboardSummary";
import EmailClassificationStatus from "@/components/dashboard/EmailClassificationStatus";
import ProjectStatusCard from "@/components/dashboard/ProjectStatusCard";
import RecentContractorsCard from "@/components/dashboard/RecentContractorsCard";
import EmailProcessingTable from "@/components/emails/EmailProcessingTable";
import BidManagementTable from "@/components/bids/BidManagementTable";

export default function Dashboard() {
  return (
    <div>
      {/* Dashboard Summary Cards */}
      <DashboardSummary />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Tables */}
        <div className="lg:col-span-2 space-y-6">
          {/* Email Processing Table */}
          <EmailProcessingTable limit={4} />
          
          {/* Bid Management Table */}
          <BidManagementTable limit={3} />
        </div>
        
        {/* Right column - Cards */}
        <div className="space-y-6">
          {/* Email Classification Status */}
          <EmailClassificationStatus />
          
          {/* Project Status Card */}
          <ProjectStatusCard />
          
          {/* Recent Contractors Card */}
          <RecentContractorsCard />
        </div>
      </div>
    </div>
  );
}
