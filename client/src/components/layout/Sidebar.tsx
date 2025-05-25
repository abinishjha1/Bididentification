import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

// Icons
import {
  LayoutDashboard,
  Mail,
  Gavel,
  Briefcase,
  HardHat,
  FileText,
  Tags,
  Settings,
  Menu
} from "lucide-react";

type SidebarProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

type NavItem = {
  name: string;
  path: string;
  icon: React.ReactNode;
};

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const [location] = useLocation();

  const navItems: NavItem[] = [
    { name: "Dashboard", path: "/", icon: <LayoutDashboard size={20} /> },
    { name: "Email Processing", path: "/emails", icon: <Mail size={20} /> },
    { name: "Bids", path: "/bids", icon: <Gavel size={20} /> },
    { name: "Projects", path: "/projects", icon: <Briefcase size={20} /> },
    { name: "Contractors", path: "/contractors", icon: <HardHat size={20} /> },
    { name: "Contracts", path: "/contracts", icon: <FileText size={20} /> },
    { name: "Classifications", path: "/classifications", icon: <Tags size={20} /> },
    { name: "Settings", path: "/settings", icon: <Settings size={20} /> },
  ];

  return (
    <aside 
      className={cn(
        "bg-primary-700 text-white flex-shrink-0 transition-all duration-300 overflow-hidden",
        isOpen ? "w-64" : "w-16"
      )}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b border-primary-800">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-md bg-primary-100 flex items-center justify-center text-primary-600">
            <Gavel size={20} />
          </div>
          {isOpen && <h1 className="ml-2 font-bold text-lg whitespace-nowrap">Bid Beacon</h1>}
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="text-white p-1 rounded-md hover:bg-primary-600"
        >
          <Menu size={20} />
        </button>
      </div>
      
      <nav className="mt-4">
        <ul>
          {navItems.map((item) => (
            <li key={item.path}>
              <Link href={item.path}>
                <a className={cn(
                  "flex items-center px-4 py-3 text-white",
                  location === item.path ? "bg-primary-800" : "hover:bg-primary-600"
                )}>
                  <span>{item.icon}</span>
                  {isOpen && <span className="ml-2">{item.name}</span>}
                </a>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
