import { useState, useRef } from "react";
import { Home, Wifi, Smartphone, CreditCard, Tv, Zap, Droplet, MoreHorizontal } from "lucide-react";
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

interface AccountItemProps {
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

const AccountItem = ({
  id,
  name,
  amount,
  category,
  dueDay,
  daysUntilDue,
  isActive,
  onToggleActive,
  onDelete,
}: AccountItemProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const { formatAmount } = useCurrency();
  const Icon = categoryIcons[category] || MoreHorizontal;
  const categoryLabel = categoryLabels[category] || "Outros";
  
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
      <div 
        className={`flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer ${!isActive ? 'opacity-60' : ''}`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleTouchStart}
        onMouseUp={handleTouchEnd}
        onMouseLeave={handleTouchEnd}
        onClick={handleClick}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-muted flex-shrink-0">
            <Icon className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <p className="font-medium">{name}</p>
            <div className="flex items-center gap-2">
              <p className="text-xs text-muted-foreground">
                {categoryLabel}
              </p>
              {badgeText && (
                <div className="inline-flex flex-col items-center justify-center bg-muted rounded-full px-2.5 py-0.5">
                  <span className="text-[9px] font-medium text-foreground leading-tight">
                    {badgeText.line1}
                  </span>
                  <span className="text-[10px] font-semibold text-foreground leading-tight">
                    {badgeText.line2}
                  </span>
                </div>
              )}
            </div>
            {!badgeText && (
              <p className="text-xs text-muted-foreground">
                • Vence dia {dueDay}
              </p>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="font-semibold text-foreground">
            {formatAmount(amount)}
          </p>
        </div>
      </div>

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

export default AccountItem;
