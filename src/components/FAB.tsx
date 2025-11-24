import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import AddTransactionDrawer from "./AddTransactionDrawer";

const FAB = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showTransactionDrawer, setShowTransactionDrawer] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleAddAccount = () => {
    setIsOpen(false);
    navigate("/add-account");
  };

  const handleAddTransaction = () => {
    setIsOpen(false);
    setShowTransactionDrawer(true);
  };

  return (
    <>
      {/* Backdrop com blur e baixa opacidade */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/30 backdrop-blur-sm z-40 animate-fade-in"
          onClick={toggleMenu}
        />
      )}

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

      <AddTransactionDrawer open={showTransactionDrawer} onOpenChange={setShowTransactionDrawer} />
    </>
  );
};

export default FAB;
