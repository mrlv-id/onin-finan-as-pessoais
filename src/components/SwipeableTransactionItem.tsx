import { useState, useRef, useEffect } from "react";
import { Pencil, Trash2 } from "lucide-react";
import TransactionItem from "./TransactionItem";

interface SwipeableTransactionItemProps {
  id: string;
  name: string;
  amount: number;
  category: any;
  type: "income" | "expense";
  date: string;
  onEdit: () => void;
  onDelete: () => void;
}

const SwipeableTransactionItem = ({
  id,
  name,
  amount,
  category,
  type,
  date,
  onEdit,
  onDelete,
}: SwipeableTransactionItemProps) => {
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const currentXRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const SWIPE_THRESHOLD = 80; // Distância mínima para revelar os botões
  const MAX_SWIPE = 140; // Distância máxima do swipe

  const handleStart = (clientX: number) => {
    setIsDragging(true);
    startXRef.current = clientX;
    currentXRef.current = translateX;
  };

  const handleMove = (clientX: number) => {
    if (!isDragging) return;

    const diff = startXRef.current - clientX;
    const newTranslateX = currentXRef.current + diff;

    // Limitar o movimento entre 0 e MAX_SWIPE
    if (newTranslateX >= 0 && newTranslateX <= MAX_SWIPE) {
      setTranslateX(newTranslateX);
    }
  };

  const handleEnd = () => {
    setIsDragging(false);

    // Se passou do threshold, manter aberto, senão fechar
    if (translateX > SWIPE_THRESHOLD) {
      setTranslateX(MAX_SWIPE);
    } else {
      setTranslateX(0);
    }
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    handleStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    handleStart(e.clientX);
  };

  const handleMouseMove = (e: MouseEvent) => {
    handleMove(e.clientX);
  };

  const handleMouseUp = () => {
    handleEnd();
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  // Fechar ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setTranslateX(0);
      }
    };

    if (translateX > 0) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside as any);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside as any);
    };
  }, [translateX]);

  return (
    <div ref={containerRef} className="relative overflow-hidden">
      {/* Botões de ação (revelados ao arrastar) */}
      <div className="absolute right-0 top-0 bottom-0 flex items-center gap-2 pr-4">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
            setTranslateX(0);
          }}
          className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary text-primary-foreground transition-transform hover:scale-110"
          style={{
            opacity: translateX > 20 ? 1 : 0,
            transition: "opacity 0.2s",
          }}
        >
          <Pencil className="w-5 h-5" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
            setTranslateX(0);
          }}
          className="flex items-center justify-center w-12 h-12 rounded-lg bg-destructive text-destructive-foreground transition-transform hover:scale-110"
          style={{
            opacity: translateX > 20 ? 1 : 0,
            transition: "opacity 0.2s",
          }}
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {/* Item da transação */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        style={{
          transform: `translateX(-${translateX}px)`,
          transition: isDragging ? "none" : "transform 0.3s ease-out",
          cursor: isDragging ? "grabbing" : "grab",
        }}
      >
        <TransactionItem
          name={name}
          amount={amount}
          category={category}
          type={type}
          date={date}
        />
      </div>
    </div>
  );
};

export default SwipeableTransactionItem;
