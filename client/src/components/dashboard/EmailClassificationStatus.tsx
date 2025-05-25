import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

type EmailClassificationStatusProps = {
  className?: string;
};

type ClassificationData = {
  category: string;
  count: number;
};

const categoryNames: Record<string, string> = {
  'bid_submission': 'Bid Submissions',
  'bid_inquiry': 'Bid Inquiries',
  'follow_up': 'Follow-ups',
  'contract_related': 'Contract Related',
  'project_update': 'Project Updates',
  'unknown': 'Unclassified'
};

const categoryColors: Record<string, string> = {
  'bid_submission': 'bg-primary-600',
  'bid_inquiry': 'bg-blue-500',
  'follow_up': 'bg-purple-500',
  'contract_related': 'bg-yellow-500',
  'project_update': 'bg-green-500',
  'unknown': 'bg-red-500'
};

export default function EmailClassificationStatus({ className }: EmailClassificationStatusProps) {
  const { data, isLoading, error } = useQuery<ClassificationData[]>({
    queryKey: ['/api/dashboard/email-stats'],
  });

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Email Classification Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-destructive">Error loading classification data</div>
        </CardContent>
      </Card>
    );
  }

  // Calculate total count and percentages
  const totalCount = data?.reduce((sum, item) => sum + item.count, 0) || 0;

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Email Classification Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading ? (
            // Loading skeleton
            Array(5).fill(0).map((_, i) => (
              <div key={i}>
                <div className="flex justify-between mb-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-8" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ))
          ) : data?.map((item) => {
            const percentage = totalCount > 0 ? (item.count / totalCount) * 100 : 0;
            
            return (
              <div key={item.category}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">{categoryNames[item.category] || item.category}</span>
                  <span className="text-sm font-medium">{item.count}</span>
                </div>
                <Progress 
                  value={percentage} 
                  className="h-2 bg-neutral-200" 
                  indicatorClassName={categoryColors[item.category] || 'bg-neutral-500'} 
                />
              </div>
            );
          })}
          
          {!isLoading && (!data || data.length === 0) && (
            <div className="text-center py-4 text-neutral-500">
              No classification data available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
