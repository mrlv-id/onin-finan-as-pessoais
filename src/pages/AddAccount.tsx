import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Home, Building2, Droplet, Zap, Wifi, Tv, Dumbbell, Smartphone, CreditCard, MoreHorizontal, ArrowLeft } from "lucide-react";

const categories = [
  { value: "rent", label: "Aluguel", icon: Home },
  { value: "internet", label: "Internet", icon: Wifi },
  { value: "phone", label: "Celular", icon: Smartphone },
  { value: "credit_card", label: "Cartão", icon: CreditCard },
  { value: "subscription", label: "Assinatura", icon: Tv },
  { value: "electricity", label: "Luz", icon: Zap },
  { value: "water", label: "Água", icon: Droplet },
  { value: "other", label: "Outros", icon: MoreHorizontal },
];

const AddAccount = () => {
  const navigate = useNavigate();
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
      navigate("/dashboard");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen pb-20 bg-background">
      <div className="container max-w-md mx-auto px-6 pt-8 space-y-6 animate-fade-in">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Adicionar Conta Fixa</h1>
            <p className="text-sm text-muted-foreground">
              Adicione uma nova conta que se repete mensalmente
            </p>
          </div>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
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
              <div className="grid grid-cols-4 gap-3">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setCategory(cat.value)}
                      className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${
                        category === cat.value
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background hover:bg-accent"
                      }`}
                    >
                      <Icon className="w-6 h-6 mb-1" />
                      <span className="text-xs text-center">{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 space-y-2">
              <Button type="submit" disabled={loading || !category} className="w-full">
                {loading ? "Salvando..." : "Salvar Conta"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/dashboard")}
                className="w-full"
              >
                Cancelar
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default AddAccount;
