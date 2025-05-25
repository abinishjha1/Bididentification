import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Building, Computer, Warehouse } from "lucide-react";

type ProjectStatusCardProps = {
  className?: string;
};

// Project status badge styling
const statusStyles: Record<string, { bg: string; text: string }> = {
  'active': { bg: 'bg-blue-100', text: 'text-blue-800' },
  'completed': { bg: 'bg-green-100', text: 'text-green-800' },
  'cancelled': { bg: 'bg-red-100', text: 'text-red-800' },
  'on_hold': { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  'contract_awarded': { bg: 'bg-green-100', text: 'text-green-800' },
  'contract_review': { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  'in_progress': { bg: 'bg-blue-100', text: 'text-blue-800' }
};

// Project type icon mapping
const projectIcons: Record<string, JSX.Element> = {
  'Construction': <Building className="h-5 w-5" />,
  'IT Services': <Computer className="h-5 w-5" />,
  'Warehouse': <Warehouse className="h-5 w-5" />
};

export default function ProjectStatusCard({ className }: ProjectStatusCardProps) {
  const { data: projects, isLoading, error } = useQuery({
    queryKey: ['/api/projects/active'],
  });

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Project Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-destructive">Error loading project data</div>
        </CardContent>
      </Card>
    );
  }

  // Get appropriate icon for project
  const getProjectIcon = (project: any) => {
    const icon = projectIcons[project.project_type] || <Building className="h-5 w-5" />;
    const bgColor = project.project_type === 'IT Services' 
      ? 'bg-green-100 text-green-600' 
      : project.project_type === 'Warehouse' 
        ? 'bg-yellow-100 text-yellow-600'
        : 'bg-primary-100 text-primary-600';
    
    return (
      <div className={`h-10 w-10 rounded-full ${bgColor} flex items-center justify-center mr-3`}>
        {icon}
      </div>
    );
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Project Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading ? (
            // Loading skeleton
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="flex items-center p-3 border border-neutral-200 rounded-lg">
                <Skeleton className="h-10 w-10 rounded-full mr-3" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-40 mb-2" />
                  <div className="flex items-center">
                    <Skeleton className="h-4 w-20 mr-2" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              </div>
            ))
          ) : projects?.length > 0 ? (
            projects.slice(0, 3).map((project: any) => (
              <div key={project.id} className="flex items-center p-3 border border-neutral-200 rounded-lg">
                {getProjectIcon(project)}
                <div className="flex-1">
                  <h4 className="text-sm font-medium">{project.name}</h4>
                  <div className="flex items-center mt-1">
                    <Badge 
                      variant="outline" 
                      className={`px-2 py-0.5 rounded text-xs ${
                        statusStyles[project.status]?.bg || 'bg-blue-100'
                      } ${
                        statusStyles[project.status]?.text || 'text-blue-800'
                      } border-none`}
                    >
                      {project.status.replace('_', ' ').charAt(0).toUpperCase() + project.status.replace('_', ' ').slice(1)}
                    </Badge>
                    <span className="text-xs text-neutral-500 ml-2">
                      {project.budget_range || 'Budget not specified'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-neutral-500">
              No active projects found
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Link href="/projects">
          <a className="text-primary-600 text-sm font-medium">View All Projects</a>
        </Link>
      </CardFooter>
    </Card>
  );
}
