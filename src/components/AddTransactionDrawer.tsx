import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCurrency } from "@/contexts/CurrencyContext";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Briefcase, 
  Laptop, 
  Percent, 
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
  { value: "freelance", label: "Freela", icon: Laptop },
  { value: "investment", label: "Invest", icon: Percent },
  { value: "other_income", label: "Outros", icon: MoreHorizontal },
];

const expenseCategories = [
  { value: "food", label: "Comida", icon: ShoppingCart },
  { value: "transport", label: "Transport", icon: Car },
  { value: "health", label: "Saúde", icon: Heart },
  { value: "entertainment", label: "Lazer", icon: Gamepad2 },
  { value: "education", label: "Educação", icon: GraduationCap },
  { value: "rent", label: "Aluguel", icon: Home },
  { value: "internet", label: "Internet", icon: Wifi },
  { value: "phone", label: "Celular", icon: Smartphone },
  { value: "credit_card", label: "Cartão", icon: CreditCard },
  { value: "other_expense", label: "Outros", icon: MoreHorizontal },
];

interface AddTransactionDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddTransactionDrawer = ({ open, onOpenChange }: AddTransactionDrawerProps) => {
  const [type, setType] = useState<"income" | "expense">("expense");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { currencySymbol } = useCurrency();

  const categories = type === "income" ? incomeCategories : expenseCategories;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive",
        duration: 1500,
      });
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("transactions").insert([{
      user_id: user.id,
      name,
      amount: parseFloat(amount),
      type,
      category: category as any,
      date: new Date().toISOString(),
    }]);

    if (error) {
      toast({
        title: "Erro ao salvar transação",
        description: error.message,
        variant: "destructive",
        duration: 1500,
      });
    } else {
      toast({
        title: "Transação criada",
        description: "Transação adicionada com sucesso",
        duration: 1500,
      });
      setName("");
      setAmount("");
      setCategory("");
      onOpenChange(false);
    }

    setLoading(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader>
          <DrawerTitle>Adicionar Transação</DrawerTitle>
          <DrawerDescription>
            Adicione uma nova receita ou despesa
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
                  placeholder={`${currencySymbol} 0.00`}
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
                  {loading ? "Salvando..." : "Salvar Transação"}
                </Button>
              </div>
            </form>
          </Tabs>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default AddTransactionDrawer;
