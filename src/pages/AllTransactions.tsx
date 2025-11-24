import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import FAB from "@/components/FAB";
import SwipeableTransactionItem from "@/components/SwipeableTransactionItem";
import EditTransactionDrawer from "@/components/EditTransactionDrawer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Transaction {
  id: string;
  name: string;
  amount: number;
  category: string;
  type: "income" | "expense";
  date: string;
}

const AllTransactions = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [periodFilter, setPeriodFilter] = useState<string>("all");
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [showEditDrawer, setShowEditDrawer] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }
      fetchTransactions(session.user.id);
    };

    checkAuth();
  }, [navigate]);

  const fetchTransactions = async (userId: string) => {
    const { data } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false });

    if (data) {
      setTransactions(data as Transaction[]);
      setFilteredTransactions(data as Transaction[]);
    }
  };

  useEffect(() => {
    let filtered = [...transactions];

    // Filtro por tipo
    if (typeFilter !== "all") {
      filtered = filtered.filter((t) => t.type === typeFilter);
    }

    // Filtro por categoria
    if (categoryFilter !== "all") {
      filtered = filtered.filter((t) => t.category === categoryFilter);
    }

    // Filtro por período
    if (periodFilter !== "all") {
      const now = new Date();
      const days = parseInt(periodFilter);
      const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      filtered = filtered.filter((t) => new Date(t.date) >= startDate);
    }

    setFilteredTransactions(filtered);
  }, [typeFilter, categoryFilter, periodFilter, transactions]);

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowEditDrawer(true);
  };

  const handleDelete = async () => {
    if (!transactionToDelete) return;

    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", transactionToDelete);

    if (error) {
      toast({
        title: "Erro ao excluir transação",
        description: error.message,
        variant: "destructive",
        duration: 1500,
      });
    } else {
      toast({
        title: "Transação excluída",
        description: "Transação excluída com sucesso",
        duration: 1500,
      });
      setTransactions((prev) => prev.filter((t) => t.id !== transactionToDelete));
    }

    setDeleteDialogOpen(false);
    setTransactionToDelete(null);
  };

  const confirmDelete = (id: string) => {
    setTransactionToDelete(id);
    setDeleteDialogOpen(true);
  };

  const allCategories = [
    { value: "salary", label: "Salário" },
    { value: "freelance", label: "Freelancer" },
    { value: "cashback", label: "Cashback" },
    { value: "pix", label: "Pix" },
    { value: "other_income", label: "Outros (Receita)" },
    { value: "groceries", label: "Mercado" },
    { value: "transport", label: "Transporte" },
    { value: "health", label: "Saúde" },
    { value: "pets", label: "Pets" },
    { value: "clothing", label: "Vestuário" },
    { value: "other_expense", label: "Outros (Despesa)" },
  ];

  return (
    <div className="min-h-screen pb-20">
      <div className="container max-w-md mx-auto px-6 pt-8 space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">Todas as Transações</h1>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Arraste uma transação para a esquerda para editar ou excluir
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <Tabs value={typeFilter} onValueChange={(v) => setTypeFilter(v as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">Todas</TabsTrigger>
              <TabsTrigger value="income">Receitas</TabsTrigger>
              <TabsTrigger value="expense">Despesas</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="grid grid-cols-2 gap-2">
            <Select value={periodFilter} onValueChange={setPeriodFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os períodos</SelectItem>
                <SelectItem value="7">Últimos 7 dias</SelectItem>
                <SelectItem value="30">Últimos 30 dias</SelectItem>
                <SelectItem value="60">Últimos 60 dias</SelectItem>
                <SelectItem value="90">Últimos 90 dias</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas categorias</SelectItem>
                {allCategories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            Nenhuma transação encontrada
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTransactions.map((transaction) => (
              <SwipeableTransactionItem
                key={transaction.id}
                id={transaction.id}
                name={transaction.name}
                amount={transaction.amount}
                category={transaction.category as any}
                type={transaction.type}
                date={transaction.date}
                onEdit={() => handleEdit(transaction)}
                onDelete={() => confirmDelete(transaction.id)}
              />
            ))}
          </div>
        )}
      </div>

      <EditTransactionDrawer
        open={showEditDrawer}
        onOpenChange={(open) => {
          setShowEditDrawer(open);
          if (!open) {
            const checkAuth = async () => {
              const { data: { session } } = await supabase.auth.getSession();
              if (session) fetchTransactions(session.user.id);
            };
            checkAuth();
          }
        }}
        transaction={editingTransaction}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir transação</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <FAB />
      <Navigation />
    </div>
  );
};

export default AllTransactions;
