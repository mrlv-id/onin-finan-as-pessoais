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

const categoryIcons = {
  salary: Briefcase,
  freelance: Laptop,
  investment: Percent,
  other_income: MoreHorizontal,
  food: ShoppingCart,
  transport: Car,
  health: Heart,
  entertainment: Gamepad2,
  education: GraduationCap,
  rent: Home,
  internet: Wifi,
  phone: Smartphone,
  credit_card: CreditCard,
  other_expense: MoreHorizontal,
};

const categoryLabels = {
  salary: "Salário",
  freelance: "Freela",
  investment: "Invest",
  other_income: "Outros",
  food: "Comida",
  transport: "Transport",
  health: "Saúde",
  entertainment: "Lazer",
  education: "Educação",
  rent: "Aluguel",
  internet: "Internet",
  phone: "Celular",
  credit_card: "Cartão",
  other_expense: "Outros",
};

interface TransactionItemProps {
  name: string;
  amount: number;
  category: keyof typeof categoryIcons;
  type: "income" | "expense";
  date: string;
}

const TransactionItem = ({ name, amount, category, type, date }: TransactionItemProps) => {
  const Icon = categoryIcons[category] || MoreHorizontal;
  const categoryLabel = categoryLabels[category] || "Outros";
  
  return (
    <div className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-muted">
          <Icon className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <p className="font-medium">{name}</p>
          <p className="text-xs text-muted-foreground">{categoryLabel}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={`font-semibold ${type === "income" ? "text-muted-foreground" : "text-foreground"}`}>
          {type === "income" ? "+" : "-"} R$ {amount.toFixed(2)}
        </p>
        <p className="text-xs text-muted-foreground">
          {new Date(date).toLocaleDateString("pt-BR")}
        </p>
      </div>
    </div>
  );
};

export default TransactionItem;
