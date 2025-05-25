import { Button } from "@/components/ui/button";
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import * as z from "zod";

const settingsSchema = z.object({
  emailNotifications: z.boolean().default(true),
  bidNotifications: z.boolean().default(true),
  contractNotifications: z.boolean().default(true),
  systemEmail: z.string().email().optional(),
  backupEmail: z.string().email().optional(),
});

type SettingsValues = z.infer<typeof settingsSchema>;

const defaultValues: SettingsValues = {
  emailNotifications: true,
  bidNotifications: true,
  contractNotifications: true,
  systemEmail: "",
  backupEmail: "",
};

export default function SettingsPage() {
  const { toast } = useToast();
  
  const form = useForm<SettingsValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: SettingsValues) => {
      return await apiRequest("/api/settings", "POST", data);
    },
    onSuccess: () => {
      toast({
        title: "Settings updated",
        description: "Your settings have been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  function onSubmit(data: SettingsValues) {
    mutate(data);
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <TabsContent value="general">
              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                  <CardDescription>
                    Manage your general application settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="systemEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>System Email</FormLabel>
                          <FormControl>
                            <Input placeholder="system@example.com" {...field} />
                          </FormControl>
                          <FormDescription>
                            Email used for system notifications and alerts
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="backupEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Backup Email</FormLabel>
                          <FormControl>
                            <Input placeholder="backup@example.com" {...field} />
                          </FormControl>
                          <FormDescription>
                            Secondary email for important notifications
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Configure how you want to receive notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="emailNotifications">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications about new emails
                      </p>
                    </div>
                    <FormField
                      control={form.control}
                      name="emailNotifications"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="bidNotifications">Bid Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications about bid updates
                      </p>
                    </div>
                    <FormField
                      control={form.control}
                      name="bidNotifications"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="contractNotifications">Contract Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications about contract changes
                      </p>
                    </div>
                    <FormField
                      control={form.control}
                      name="contractNotifications"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="system">
              <Card>
                <CardHeader>
                  <CardTitle>System Settings</CardTitle>
                  <CardDescription>
                    Advanced system configuration options
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-medium">Database Information</h3>
                    <p className="text-sm text-muted-foreground">
                      Connected to PostgreSQL database
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-medium">Application Version</h3>
                    <p className="text-sm text-muted-foreground">
                      Bid Beacon Manager v1.0.0
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save Settings"}
            </Button>
          </form>
        </Form>
      </Tabs>
    </div>
  );
}