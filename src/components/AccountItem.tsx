import { Home, Wifi, Smartphone, CreditCard, Tv, Building2, Droplet, MoreHorizontal } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";

const categoryIcons = {
  rent: Home,
  internet: Wifi,
  phone: Smartphone,
  credit_card: CreditCard,
  subscription: Tv,
  bill: Building2,
  loan: Droplet,
  other: MoreHorizontal,
};

const categoryLabels = {
  rent: "Aluguel",
  internet: "Internet",
  phone: "Celular",
  credit_card: "Cartão",
  subscription: "Assinatura",
  bill: "Conta",
  loan: "Empréstimo",
  other: "Outros",
};

interface AccountItemProps {
  id: string;
  name: string;
  amount: number;
  category: keyof typeof categoryIcons;
  dueDay: number;
  isActive: boolean;
  onToggleActive: (id: string, isActive: boolean) => void;
  onDelete: (id: string) => void;
}

const AccountItem = ({
  id,
  name,
  amount,
  category,
  dueDay,
  isActive,
  onToggleActive,
  onDelete,
}: AccountItemProps) => {
  const Icon = categoryIcons[category] || MoreHorizontal;
  const categoryLabel = categoryLabels[category] || "Outros";

  return (
    <Card className={`p-4 ${!isActive ? 'opacity-60' : ''}`}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{name}</p>
            <p className="text-sm text-muted-foreground">
              {categoryLabel} • Vence dia {dueDay}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-right flex-shrink-0">
            <p className="font-semibold text-foreground">
              R$ {amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Switch
              checked={isActive}
              onCheckedChange={(checked) => onToggleActive(id, checked)}
            />
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir conta fixa</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja excluir "{name}"? Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(id)}>
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AccountItem;
