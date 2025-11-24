import { LayoutDashboard, Wallet, User } from "lucide-react";
import { NavLink } from "@/components/NavLink";

const Navigation = () => {
  const navItems = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/wallet", icon: Wallet, label: "Carteira" },
    { to: "/profile", icon: User, label: "Perfil" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-[60]">
      <div className="container max-w-md mx-auto">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className="flex flex-col items-center justify-center gap-1 px-4 py-2 text-muted-foreground transition-colors"
              activeClassName="text-foreground"
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
