import { useState } from "react";
import { Plus, X, FileText, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import AddAccountDrawer from "./AddAccountDrawer";
import AddTransactionDrawer from "./AddTransactionDrawer";

const FAB = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAccountDrawer, setShowAccountDrawer] = useState(false);
  const [showTransactionDrawer, setShowTransactionDrawer] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleAddAccount = () => {
    setIsOpen(false);
    setShowAccountDrawer(true);
  };

  const handleAddTransaction = () => {
    setIsOpen(false);
    setShowTransactionDrawer(true);
  };

  return (
    <>
      <div className="fixed bottom-20 right-6 z-50">
        {isOpen && (
          <div className="absolute bottom-16 right-0 flex flex-col gap-3 animate-scale-in">
            <Button
              size="lg"
              variant="secondary"
              className="h-12 px-6 rounded-full shadow-lg whitespace-nowrap"
              onClick={handleAddTransaction}
            >
              Adicionar Transação
            </Button>
            <Button
              size="lg"
              variant="secondary"
              className="h-12 px-6 rounded-full shadow-lg whitespace-nowrap"
              onClick={handleAddAccount}
            >
              Adicionar Conta Fixa
            </Button>
          </div>
        )}

        <Button
          size="lg"
          className="w-14 h-14 rounded-full shadow-xl"
          onClick={toggleMenu}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
        </Button>
      </div>

      <AddAccountDrawer open={showAccountDrawer} onOpenChange={setShowAccountDrawer} />
      <AddTransactionDrawer open={showTransactionDrawer} onOpenChange={setShowTransactionDrawer} />
    </>
  );
};

export default FAB;
