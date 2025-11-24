import { useState } from "react";
import { Plus, X, FileText, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";

const FAB = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <div className="fixed bottom-20 right-6 z-50">
      {isOpen && (
        <div className="absolute bottom-16 right-0 flex flex-col gap-3 animate-scale-in">
          <Button
            size="lg"
            variant="secondary"
            className="w-14 h-14 rounded-full shadow-lg"
            onClick={() => console.log("Nova transação")}
          >
            <FileText className="w-5 h-5" />
          </Button>
          <Button
            size="lg"
            variant="secondary"
            className="w-14 h-14 rounded-full shadow-lg"
            onClick={() => console.log("Nova conta")}
          >
            <CreditCard className="w-5 h-5" />
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
  );
};

export default FAB;
