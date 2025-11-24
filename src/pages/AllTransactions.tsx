import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const AllTransactions = () => {
  const navigate = useNavigate();

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
    <div className="min-h-screen pb-8">
      <div className="container max-w-md mx-auto px-6 pt-8 space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-3xl font-bold">Todas as transações</h1>
        </div>

        <div className="text-center py-12 text-muted-foreground">
          Nenhuma transação cadastrada
        </div>

        <p className="text-sm text-center text-muted-foreground">
          Arraste para o lado para editar ou excluir uma transação
        </p>
      </div>
    </div>
  );
};

export default AllTransactions;
