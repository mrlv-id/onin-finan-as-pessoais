import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useCache } from "@/contexts/CacheContext";
import Navigation from "@/components/Navigation";
import FAB from "@/components/FAB";
import AccountCard from "@/components/AccountCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
const Wallet = () => {
  const navigate = useNavigate();
  const {
    cache,
    updateCache
  } = useCache();
  const [period, setPeriod] = useState("7");
  const [totalBalance, setTotalBalance] = useState(cache.totalBalance[period] || 0);
  const [accounts, setAccounts] = useState<FixedAccountWithDays[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const {
    toast
  } = useToast();
  useEffect(() => {
    const initializePage = async () => {
      const {
        data: {
          session
        }
      } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }
      setUserId(session.user.id);

      // Calculate date based on period
      const today = new Date();
      const startDate = new Date();
      startDate.setDate(today.getDate() - Number(period));

      // Fetch balance and accounts in parallel
      const [transactionsResult, accountsResult] = await Promise.all([supabase.from("transactions").select("*").eq("user_id", session.user.id).gte("date", startDate.toISOString()), supabase.from("fixed_accounts").select("*").eq("user_id", session.user.id).order("due_day", {
        ascending: true
      })]);
      if (transactionsResult.data) {
        const balance = transactionsResult.data.reduce((acc, transaction) => {
          if (transaction.type === "income") {
            return acc + Number(transaction.amount);
          } else {
            return acc - Number(transaction.amount);
          }
        }, 0);
        setTotalBalance(balance);
        updateCache({
          totalBalance: {
            ...cache.totalBalance,
            [period]: balance
          }
        });
      }
      if (accountsResult.data) {
        const fixedAccounts = accountsResult.data as FixedAccount[];
        const sortedAccounts = sortAccountsByDueDate(fixedAccounts);
        setAccounts(sortedAccounts);
        updateCache({
          fixedAccounts
        });
      }
      setIsLoading(false);
    };
    initializePage();
  }, [navigate, period]);
  useEffect(() => {
    if (!userId) return;
    const fetchBalance = async () => {
      const today = new Date();
      const startDate = new Date();
      startDate.setDate(today.getDate() - Number(period));
      const {
        data
      } = await supabase.from("transactions").select("*").eq("user_id", userId).gte("date", startDate.toISOString());
      if (data) {
        const balance = data.reduce((acc, transaction) => {
          if (transaction.type === "income") {
            return acc + Number(transaction.amount);
          } else {
            return acc - Number(transaction.amount);
          }
        }, 0);
        setTotalBalance(balance);
        updateCache({
          totalBalance: {
            ...cache.totalBalance,
            [period]: balance
          }
        });
      }
    };
    const channel = supabase.channel("wallet-changes").on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "transactions",
      filter: `user_id=eq.${userId}`
    }, () => {
      fetchBalance();
    }).on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "fixed_accounts",
      filter: `user_id=eq.${userId}`
    }, async () => {
      const {
        data
      } = await supabase.from("fixed_accounts").select("*").eq("user_id", userId).order("due_day", {
        ascending: true
      });
      if (data) {
        const fixedAccounts = data as FixedAccount[];
        const sortedAccounts = sortAccountsByDueDate(fixedAccounts);
        setAccounts(sortedAccounts);
        updateCache({
          fixedAccounts
        });
      }
    }).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, period]);
  const handleToggleActive = async (id: string, isActive: boolean) => {
    const {
      error
    } = await supabase.from("fixed_accounts").update({
      is_active: isActive
    }).eq("id", id);
    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a conta",
        variant: "destructive",
        duration: 1500
      });
    } else {
      toast({
        title: isActive ? "Conta ativada" : "Conta pausada",
        description: isActive ? "A conta foi reativada" : "A conta foi pausada",
        duration: 1500
      });
    }
  };
  const handleDelete = async (id: string) => {
    const {
      error
    } = await supabase.from("fixed_accounts").delete().eq("id", id);
    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir a conta",
        variant: "destructive",
        duration: 1500
      });
    } else {
      toast({
        title: "Conta excluída",
        description: "A conta foi removida com sucesso",
        duration: 1500
      });
    }
  };
  return <div className="min-h-screen pb-20">
      <div className="container max-w-md mx-auto px-6 pt-8 space-y-8 animate-fade-in">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-center">Carteira</h1>

          <Card className="p-6 space-y-2">
            <p className="text-sm text-muted-foreground">Saldo consolidado</p>
            {isLoading ? <div className="h-10 w-48 bg-muted animate-pulse rounded" /> : <h2 className={`text-4xl font-bold ${totalBalance >= 0 ? 'text-foreground' : 'text-destructive'}`}>
                R$ {totalBalance.toLocaleString('pt-BR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
              </h2>}
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
            <Button variant="ghost" size="sm" onClick={() => navigate("/accounts")}>
              Ver todas
            </Button>
          </div>

          {isLoading ? <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />)}
            </div> : accounts.length === 0 ? <div className="text-center py-12 text-muted-foreground">
              Nenhuma conta cadastrada
            </div> : <div className="grid grid-cols-2 gap-3">
              {accounts.map(account => <AccountCard key={account.id} id={account.id} name={account.name} amount={Number(account.amount)} category={account.category as any} dueDay={account.due_day} daysUntilDue={account.daysUntilDue} isActive={account.is_active} onToggleActive={handleToggleActive} onDelete={handleDelete} />)}
            </div>}
        </div>
      </div>

      <FAB />
      <Navigation />
    </div>;
};
export default Wallet;