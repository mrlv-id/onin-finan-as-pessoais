import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import FAB from "@/components/FAB";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Wallet = () => {
  const navigate = useNavigate();
  const [period, setPeriod] = useState("7");

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
      }
    };

    checkAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen pb-20">
      <div className="container max-w-md mx-auto px-6 pt-8 space-y-8 animate-fade-in">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">Carteira</h1>

          <Card className="p-6 space-y-2">
            <p className="text-sm text-muted-foreground">Saldo consolidado</p>
            <h2 className="text-4xl font-bold">R$ 0,00</h2>
          </Card>

          <Tabs value={period} onValueChange={setPeriod} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="7">7 dias</TabsTrigger>
              <TabsTrigger value="30">30 dias</TabsTrigger>
              <TabsTrigger value="60">60 dias</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Contas fixas</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/accounts")}
            >
              Ver todas
            </Button>
          </div>

          <div className="text-center py-12 text-muted-foreground">
            Nenhuma conta cadastrada
          </div>
        </div>
      </div>

      <FAB />
      <Navigation />
    </div>
  );
};

export default Wallet;
