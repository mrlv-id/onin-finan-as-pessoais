import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 animate-fade-in">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-4 animate-scale-in">
          <h1 className="text-6xl font-bold tracking-tighter">Onin</h1>
          <p className="text-lg text-muted-foreground">
            Suas finanças na palma da sua mão
          </p>
        </div>

        <div className="pt-8 animate-slide-up">
          <Button
            size="lg"
            className="w-full h-14 text-base font-medium rounded-2xl"
            onClick={() => navigate("/login")}
          >
            Começar jornada
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Landing;
