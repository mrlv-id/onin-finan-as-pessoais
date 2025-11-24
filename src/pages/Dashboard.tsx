import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { User } from "@supabase/supabase-js";
import Navigation from "@/components/Navigation";
import FAB from "@/components/FAB";
import TransactionItem from "@/components/TransactionItem";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Transaction {
  id: string;
  name: string;
  amount: number;
  category: string;
  type: "income" | "expense";
  date: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [greeting, setGreeting] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [todayBalance, setTodayBalance] = useState(0);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Bom dia");
    else if (hour < 18) setGreeting("Boa tarde");
    else setGreeting("Boa noite");
  }, []);

  useEffect(() => {
    const initializePage = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/login");
        return;
      }

      setUser(session.user);

      // Get today's date at 00:00:00
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Fetch both queries in parallel
      const [recentResult, todayResult] = await Promise.all([
        supabase
          .from("transactions")
          .select("*")
          .eq("user_id", session.user.id)
          .order("date", { ascending: false })
          .limit(4),
        supabase
          .from("transactions")
          .select("*")
          .eq("user_id", session.user.id)
          .gte("date", today.toISOString())
      ]);

      if (recentResult.data) {
        setTransactions(recentResult.data as Transaction[]);
      }
      
      if (todayResult.data) {
        const balance = todayResult.data.reduce((acc, transaction) => {
          if (transaction.type === "income") {
            return acc + Number(transaction.amount);
          } else {
            return acc - Number(transaction.amount);
          }
        }, 0);
        setTodayBalance(balance);
      }
    };

    initializePage();

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
    if (!user) return;

    const fetchTransactions = async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const [recentResult, todayResult] = await Promise.all([
        supabase
          .from("transactions")
          .select("*")
          .eq("user_id", user.id)
          .order("date", { ascending: false })
          .limit(4),
        supabase
          .from("transactions")
          .select("*")
          .eq("user_id", user.id)
          .gte("date", today.toISOString())
      ]);

      if (recentResult.data) {
        setTransactions(recentResult.data as Transaction[]);
      }
      
      if (todayResult.data) {
        const balance = todayResult.data.reduce((acc, transaction) => {
          if (transaction.type === "income") {
            return acc + Number(transaction.amount);
          } else {
            return acc - Number(transaction.amount);
          }
        }, 0);
        setTodayBalance(balance);
      }
    };

    const channel = supabase
      .channel("transactions-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "transactions",
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchTransactions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

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
          <p className="text-sm text-muted-foreground">Saldo de hoje</p>
          <h2 className={`text-4xl font-bold ${todayBalance >= 0 ? 'text-foreground' : 'text-destructive'}`}>
            R$ {todayBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h2>
        </Card>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Últimas transações</h3>
            <Button variant="ghost" size="sm" onClick={() => navigate("/transactions")}>
              Ver todas
            </Button>
          </div>

          {transactions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Nenhuma transação ainda
            </div>
          ) : (
            <div className="space-y-2">
              {transactions.map((transaction) => (
                <TransactionItem
                  key={transaction.id}
                  name={transaction.name}
                  amount={transaction.amount}
                  category={transaction.category as any}
                  type={transaction.type}
                  date={transaction.date}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <FAB />
      <Navigation />
    </div>
  );
};

export default Dashboard;
