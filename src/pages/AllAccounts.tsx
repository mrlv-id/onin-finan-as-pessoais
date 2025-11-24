import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import AccountItem from "@/components/AccountItem";
import { useToast } from "@/hooks/use-toast";
import { sortAccountsByDueDate, FixedAccountWithDays } from "@/lib/accountUtils";

interface FixedAccount {
  id: string;
  name: string;
  amount: number;
  category: string;
  due_day: number;
  is_active: boolean;
}

const AllAccounts = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<FixedAccountWithDays[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }

      setUserId(session.user.id);

      const { data } = await supabase
        .from("fixed_accounts")
        .select("*")
        .eq("user_id", session.user.id);

      if (data) {
        const fixedAccounts = data as FixedAccount[];
        const sortedAccounts = sortAccountsByDueDate(fixedAccounts);
        setAccounts(sortedAccounts);
      }

      setIsLoading(false);
    };

    checkAuth();
  }, [navigate]);

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel("accounts-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "fixed_accounts",
          filter: `user_id=eq.${userId}`,
        },
        async () => {
          const { data } = await supabase
            .from("fixed_accounts")
            .select("*")
            .eq("user_id", userId);

          if (data) {
            const fixedAccounts = data as FixedAccount[];
            const sortedAccounts = sortAccountsByDueDate(fixedAccounts);
            setAccounts(sortedAccounts);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const handleToggleActive = async (id: string, isActive: boolean) => {
    const { error } = await supabase
      .from("fixed_accounts")
      .update({ is_active: isActive })
      .eq("id", id);

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a conta",
        variant: "destructive",
        duration: 1500,
      });
    } else {
      toast({
        title: isActive ? "Conta ativada" : "Conta pausada",
        description: isActive ? "A conta foi reativada" : "A conta foi pausada",
        duration: 1500,
      });
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("fixed_accounts").delete().eq("id", id);

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir a conta",
        variant: "destructive",
        duration: 1500,
      });
    } else {
      toast({
        title: "Conta excluída",
        description: "A conta foi removida com sucesso",
        duration: 1500,
      });
    }
  };

  return (
    <div className="min-h-screen pb-8">
      <div className="container max-w-md mx-auto px-6 pt-8 space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/wallet")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-3xl font-bold">Todas as contas</h1>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : accounts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            Nenhuma conta cadastrada
          </div>
        ) : (
          <div className="space-y-3">
            {accounts.map((account) => (
              <AccountItem
                key={account.id}
                id={account.id}
                name={account.name}
                amount={Number(account.amount)}
                category={account.category as any}
                dueDay={account.due_day}
                daysUntilDue={account.daysUntilDue}
                isActive={account.is_active}
                onToggleActive={handleToggleActive}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        <p className="text-sm text-center text-muted-foreground">
          Toque uma vez para pausar e pressione para excluir
        </p>
      </div>
    </div>
  );
};

export default AllAccounts;
