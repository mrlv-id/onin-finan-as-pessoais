import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Home, Building2, Droplet, Zap, Wifi, Tv, Dumbbell, Smartphone, CreditCard, MoreHorizontal } from "lucide-react";

const categories = [
  { value: "rent", label: "Aluguel", icon: Home },
  { value: "condo", label: "Condomínio", icon: Building2 },
  { value: "water", label: "Água", icon: Droplet },
  { value: "electricity", label: "Luz", icon: Zap },
  { value: "internet", label: "Internet", icon: Wifi },
  { value: "streaming", label: "Streaming", icon: Tv },
  { value: "gym", label: "Academia", icon: Dumbbell },
  { value: "phone", label: "Celular", icon: Smartphone },
  { value: "card", label: "Cartão", icon: CreditCard },
  { value: "other", label: "Outros", icon: MoreHorizontal },
];

interface AddAccountDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddAccountDrawer = ({ open, onOpenChange }: AddAccountDrawerProps) => {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDay, setDueDay] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("fixed_accounts").insert([{
      user_id: user.id,
      name,
      amount: parseFloat(amount),
      due_day: parseInt(dueDay),
      category: category as any,
    }]);

    if (error) {
      toast({
        title: "Erro ao salvar conta",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Conta criada",
        description: "Conta fixa adicionada com sucesso",
      });
      setName("");
      setAmount("");
      setDueDay("");
      setCategory("");
      onOpenChange(false);
    }

    setLoading(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[70vh]">
        <DrawerHeader>
          <DrawerTitle>Adicionar Conta Fixa</DrawerTitle>
          <DrawerDescription>
            Adicione uma nova conta que se repete mensalmente
          </DrawerDescription>
        </DrawerHeader>

        <form onSubmit={handleSubmit} className="px-4 pb-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da conta</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Ex: Netflix"
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
            <Label htmlFor="dueDay">Dia do vencimento</Label>
            <Input
              id="dueDay"
              type="number"
              min="1"
              max="31"
              value={dueDay}
              onChange={(e) => setDueDay(e.target.value)}
              required
              placeholder="1-31"
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
                    className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all flex-shrink-0 w-20 ${
                      category === cat.value
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background hover:bg-accent"
                    }`}
                  >
                    <Icon className="w-6 h-6 mb-1" />
                    <span className="text-xs">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 space-y-2">
            <Button type="submit" disabled={loading || !category} className="w-full">
              {loading ? "Salvando..." : "Salvar Conta"}
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" className="w-full">Cancelar</Button>
            </DrawerClose>
          </div>
        </form>
      </DrawerContent>
    </Drawer>
  );
};

export default AddAccountDrawer;
