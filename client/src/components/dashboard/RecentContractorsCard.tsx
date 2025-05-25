import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

type RecentContractorsCardProps = {
  className?: string;
};

export default function RecentContractorsCard({ className }: RecentContractorsCardProps) {
  const { data: contractors, isLoading, error } = useQuery({
    queryKey: ['/api/contractors'],
  });

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Recent Contractors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-destructive">Error loading contractor data</div>
        </CardContent>
      </Card>
    );
  }

  // Get initials from contractor name
  const getInitials = (name: string): string => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Recent Contractors</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {isLoading ? (
            // Loading skeleton
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="flex items-center">
                <Skeleton className="h-10 w-10 rounded-full mr-3" />
                <div>
                  <Skeleton className="h-4 w-32 mb-1" />
                  <Skeleton className="h-3 w-40" />
                </div>
              </div>
            ))
          ) : contractors?.length > 0 ? (
            contractors.slice(0, 3).map((contractor: any) => (
              <div key={contractor.id} className="flex items-center">
                <Avatar className="h-10 w-10 mr-3 bg-neutral-200">
                  <AvatarFallback className="text-neutral-600 font-medium">
                    {getInitials(contractor.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{contractor.name}</p>
                  <p className="text-xs text-neutral-500">{contractor.certification_level || 'No certification'}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-neutral-500">
              No contractors found
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Link href="/contractors">
          <a className="text-primary-600 text-sm font-medium">View All Contractors</a>
        </Link>
      </CardFooter>
    </Card>
  );
}
