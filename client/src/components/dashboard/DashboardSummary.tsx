import { useQuery } from "@tanstack/react-query";
import { ArrowUpIcon, ArrowDownIcon, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

type SummaryItem = {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: string;
    positive: boolean;
  };
  secondaryText?: string;
  iconBgColor: string;
  iconColor: string;
};

type DashboardSummaryProps = {
  className?: string;
};

export default function DashboardSummary({ className }: DashboardSummaryProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/dashboard/summary'],
  });

  if (error) {
    return <div className="text-destructive">Error loading dashboard summary</div>;
  }

  // Format currency value
  const formatCurrency = (value: number): string => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value.toLocaleString()}`;
  };

  const summaryItems: SummaryItem[] = [
    {
      title: "Active Bids",
      value: isLoading ? "—" : data?.activeBids || 0,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-gavel">
          <path d="m14 13-7.5 7.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0a2.12 2.12 0 0 1 0-3L11 10" />
          <path d="m16 16 6-6" />
          <path d="m8 8 6-6" />
          <path d="m9 7 8 8" />
          <path d="m21 11-8-8" />
        </svg>
      ),
      trend: {
        value: "12% from last month",
        positive: true
      },
      iconBgColor: "bg-primary-50",
      iconColor: "text-primary-500"
    },
    {
      title: "Unprocessed Emails",
      value: isLoading ? "—" : data?.unprocessedEmails || 0,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-mail">
          <rect width="20" height="16" x="2" y="4" rx="2" />
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
      ),
      secondaryText: "3 need attention",
      iconBgColor: "bg-warning-50",
      iconColor: "text-warning-500"
    },
    {
      title: "Active Projects",
      value: isLoading ? "—" : data?.activeProjects || 0,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-briefcase">
          <rect width="20" height="14" x="2" y="7" rx="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      ),
      secondaryText: "5 due this month",
      iconBgColor: "bg-secondary-50",
      iconColor: "text-secondary-500"
    },
    {
      title: "Total Contract Value",
      value: isLoading ? "—" : formatCurrency(data?.totalContractValue || 0),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-dollar-sign">
          <line x1="12" x2="12" y1="2" y2="22" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
      trend: {
        value: "24% from previous quarter",
        positive: true
      },
      iconBgColor: "bg-success-50",
      iconColor: "text-success-500"
    }
  ];

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6", className)}>
      {summaryItems.map((item, index) => (
        <Card key={index} className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-500 text-sm">{item.title}</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-20 mt-1" />
                ) : (
                  <p className="text-2xl font-semibold mt-1">{item.value}</p>
                )}
              </div>
              <div className={cn("h-12 w-12 rounded-full flex items-center justify-center", item.iconBgColor)}>
                <div className={item.iconColor}>{item.icon}</div>
              </div>
            </div>
            
            <div className="mt-4">
              {item.trend ? (
                <p className={cn(
                  "text-sm flex items-center",
                  item.trend.positive ? "text-success-500" : "text-destructive"
                )}>
                  {item.trend.positive ? (
                    <ArrowUpIcon className="mr-1" size={16} />
                  ) : (
                    <ArrowDownIcon className="mr-1" size={16} />
                  )}
                  {item.trend.value}
                </p>
              ) : item.secondaryText ? (
                <p className="text-sm text-neutral-500 flex items-center">
                  <Clock className="mr-1" size={16} />
                  {item.secondaryText}
                </p>
              ) : null}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
