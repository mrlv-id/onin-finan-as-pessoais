import { useState, useRef } from "react";
import { Home, Wifi, Smartphone, CreditCard, Tv, Zap, Droplet, MoreHorizontal } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCurrency } from "@/contexts/CurrencyContext";
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
import { getDueBadgeText } from "@/lib/accountUtils";

const categoryIcons = {
  rent: Home,
  internet: Wifi,
  phone: Smartphone,
  credit_card: CreditCard,
  subscription: Tv,
  electricity: Zap,
  water: Droplet,
  other: MoreHorizontal,
};

const categoryLabels = {
  rent: "Aluguel",
  internet: "Internet",
  phone: "Celular",
  credit_card: "Cartão",
  subscription: "Assinatura",
  electricity: "Luz",
  water: "Água",
  other: "Outros",
};

interface AccountCardProps {
  id: string;
  name: string;
  amount: number;
  category: keyof typeof categoryIcons;
  dueDay: number;
  daysUntilDue?: number;
  isActive: boolean;
  onToggleActive: (id: string, isActive: boolean) => void;
  onDelete: (id: string) => void;
}

const AccountCard = ({
  id,
  name,
  amount,
  category,
  dueDay,
  daysUntilDue,
  isActive,
  onToggleActive,
  onDelete,
}: AccountCardProps) => {
  const { formatAmount } = useCurrency();
  const Icon = categoryIcons[category] || MoreHorizontal;
  const categoryLabel = categoryLabels[category] || "Outros";
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  
  const badgeText = daysUntilDue !== undefined ? getDueBadgeText(daysUntilDue) : null;

  const handleTouchStart = () => {
    longPressTimer.current = setTimeout(() => {
      setShowDeleteDialog(true);
    }, 500);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleClick = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    onToggleActive(id, !isActive);
  };

  return (
    <>
      <Card 
        className={`p-4 cursor-pointer transition-all hover:shadow-md ${!isActive ? 'opacity-60' : ''}`}
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleTouchStart}
        onMouseUp={handleTouchEnd}
        onMouseLeave={handleTouchEnd}
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="p-3 rounded-full bg-primary/10">
            <Icon className="w-6 h-6 text-primary" />
          </div>
          <div className="w-full space-y-1">
            <p className="font-semibold text-sm truncate">{name}</p>
            <p className="text-xs text-muted-foreground">
              {categoryLabel}
            </p>
            {badgeText ? (
              <div className="inline-flex flex-col items-center justify-center bg-muted rounded-full px-3 py-1.5 min-w-[80px]">
                <span className="text-[10px] font-medium text-foreground leading-tight">
                  {badgeText.line1}
                </span>
                <span className="text-[11px] font-semibold text-foreground leading-tight">
                  {badgeText.line2}
                </span>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                Vence dia {dueDay}
              </p>
            )}
          </div>
          <p className="font-bold text-foreground">
            {formatAmount(amount)}
          </p>
        </div>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
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
    </>
  );
};

export default AccountCard;
