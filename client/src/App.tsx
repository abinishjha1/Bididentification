import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppShell from "@/components/layout/AppShell";
import Dashboard from "@/pages/Dashboard";
import EmailProcessing from "@/pages/EmailProcessing";
import Bids from "@/pages/Bids";
import Projects from "@/pages/Projects";
import Contractors from "@/pages/Contractors";
import Contracts from "@/pages/Contracts";
import Classifications from "@/pages/Classifications";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <AppShell>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/emails" component={EmailProcessing} />
        <Route path="/bids" component={Bids} />
        <Route path="/projects" component={Projects} />
        <Route path="/contractors" component={Contractors} />
        <Route path="/contracts" component={Contracts} />
        <Route path="/classifications" component={Classifications} />
        <Route path="/settings" component={Settings} />
        <Route component={NotFound} />
      </Switch>
    </AppShell>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
