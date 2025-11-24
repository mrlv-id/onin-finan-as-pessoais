import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Briefcase, 
  Laptop, 
  Gift, 
  Send, 
  MoreHorizontal,
  ShoppingCart,
  Car,
  Heart,
  Gamepad2,
  GraduationCap,
  Home,
  Wifi,
  Smartphone,
  CreditCard
} from "lucide-react";

const incomeCategories = [
  { value: "salary", label: "Salário", icon: Briefcase },
  { value: "freelance", label: "Freelancer", icon: Laptop },
  { value: "investment", label: "Investimento", icon: Gift },
  { value: "other_income", label: "Outros", icon: MoreHorizontal },
];

const expenseCategories = [
  { value: "food", label: "Alimentação", icon: ShoppingCart },
  { value: "transport", label: "Transporte", icon: Car },
  { value: "health", label: "Saúde", icon: Heart },
  { value: "entertainment", label: "Lazer", icon: Gamepad2 },
  { value: "education", label: "Educação", icon: GraduationCap },
  { value: "rent", label: "Aluguel", icon: Home },
  { value: "internet", label: "Internet", icon: Wifi },
  { value: "phone", label: "Celular", icon: Smartphone },
  { value: "credit_card", label: "Cartão", icon: CreditCard },
  { value: "other_expense", label: "Outros", icon: MoreHorizontal },
];

interface EditTransactionDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: {
    id: string;
    name: string;
    amount: number;
    type: "income" | "expense";
    category: string;
  } | null;
}

const EditTransactionDrawer = ({ open, onOpenChange, transaction }: EditTransactionDrawerProps) => {
  const [type, setType] = useState<"income" | "expense">("expense");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (transaction) {
      setType(transaction.type);
      setName(transaction.name);
      setAmount(transaction.amount.toString());
      setCategory(transaction.category);
    }
  }, [transaction]);

  const categories = type === "income" ? incomeCategories : expenseCategories;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transaction) return;
    
    setLoading(true);

    const { error } = await supabase
      .from("transactions")
      .update({
        name,
        amount: parseFloat(amount),
        type,
        category: category as any,
      })
      .eq("id", transaction.id);

    if (error) {
      toast({
        title: "Erro ao atualizar transação",
        description: error.message,
        variant: "destructive",
        duration: 1500,
      });
    } else {
      toast({
        title: "Transação atualizada",
        description: "Transação atualizada com sucesso",
        duration: 1500,
      });
      onOpenChange(false);
    }

    setLoading(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader>
          <DrawerTitle>Editar Transação</DrawerTitle>
          <DrawerDescription>
            Edite as informações da transação
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-4 pb-4">
          <Tabs value={type} onValueChange={(v) => setType(v as "income" | "expense")} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="income">Receita</TabsTrigger>
              <TabsTrigger value="expense">Despesa</TabsTrigger>
            </TabsList>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da transação</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Ex: Compras do mês"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Valor</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label>Categoria</Label>
                <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
                  {categories.map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => setCategory(cat.value)}
                        className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all flex-shrink-0 w-16 ${
                          category === cat.value
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background hover:bg-accent"
                        }`}
                      >
                        <Icon className="w-5 h-5 mb-1" />
                        <span className="text-xs">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 pb-20">
                <Button type="submit" disabled={loading || !category} className="w-full">
                  {loading ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </div>
            </form>
          </Tabs>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default EditTransactionDrawer;
