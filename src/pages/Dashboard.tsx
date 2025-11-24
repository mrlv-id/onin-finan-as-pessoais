import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { User } from "@supabase/supabase-js";
import Navigation from "@/components/Navigation";
import FAB from "@/components/FAB";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }
      setUser(session.user);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (!session) {
        navigate("/login");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Bom dia");
    else if (hour < 18) setGreeting("Boa tarde");
    else setGreeting("Boa noite");
  }, []);

  const userName = user?.user_metadata?.name?.split(" ")[0] || "Usuário";

  return (
    <div className="min-h-screen pb-20">
      <div className="container max-w-md mx-auto px-6 pt-8 space-y-8 animate-fade-in">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            {greeting}, {userName}
          </h1>
          <p className="text-muted-foreground">Como estão suas finanças hoje?</p>
        </div>

        <Card className="p-6 space-y-2">
          <p className="text-sm text-muted-foreground">Saldo total</p>
          <h2 className="text-4xl font-bold">R$ 0,00</h2>
        </Card>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Últimas transações</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/transactions")}
            >
              Ver todas
            </Button>
          </div>

          <div className="text-center py-12 text-muted-foreground">
            Nenhuma transação ainda
          </div>
        </div>
      </div>

      <FAB />
      <Navigation />
    </div>
  );
};

export default Dashboard;
