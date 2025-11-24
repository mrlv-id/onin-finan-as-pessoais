import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Wallet, TrendingUp, Bell, Shield, ArrowRight } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Wallet,
      title: "Controle Total",
      description: "Gerencie suas receitas e despesas em um só lugar"
    },
    {
      icon: TrendingUp,
      title: "Visualize Padrões",
      description: "Entenda seus hábitos financeiros com clareza"
    },
    {
      icon: Bell,
      title: "Nunca Esqueça",
      description: "Lembretes de contas fixas e vencimentos"
    },
    {
      icon: Shield,
      title: "Dados Seguros",
      description: "Suas informações protegidas e privadas"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Header com botão de Login */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold">Onin</h2>
          <Button 
            variant="ghost" 
            onClick={() => navigate("/login")}
            className="font-medium text-sm sm:text-base h-9 sm:h-10 px-3 sm:px-4"
          >
            Entrar
          </Button>
        </div>
      </header>

      {/* Hero Section - ATTENTION */}
      <section className="pt-24 sm:pt-32 pb-12 sm:pb-20 px-4 sm:px-6">
        <div className="container max-w-4xl mx-auto text-center space-y-6 sm:space-y-8 animate-fade-in">
          <div className="space-y-3 sm:space-y-4">
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tighter leading-tight">
              Suas Finanças,
              <br />
              <span className="text-muted-foreground">Descomplicadas</span>
            </h1>
            <p className="text-base sm:text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto px-4">
              Controle total do seu dinheiro em uma interface simples e poderosa
            </p>
          </div>

          <div className="pt-2 sm:pt-4">
            <Button
              size="lg"
              className="h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base font-medium rounded-2xl group w-full sm:w-auto"
              onClick={() => navigate("/signup")}
            >
              Começar jornada
              <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section - INTEREST & DESIRE */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 bg-muted/30">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-16 space-y-3 sm:space-y-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
              Tudo que você precisa
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
              Ferramentas essenciais para organizar sua vida financeira
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 sm:gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="p-5 sm:p-6 rounded-2xl border bg-card hover:shadow-lg transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="p-2.5 sm:p-3 rounded-xl bg-primary flex-shrink-0">
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
                    </div>
                    <div className="flex-1 space-y-1.5 sm:space-y-2">
                      <h3 className="text-lg sm:text-xl font-semibold">{feature.title}</h3>
                      <p className="text-sm sm:text-base text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section - DESIRE */}
      <section className="py-12 sm:py-20 px-4 sm:px-6">
        <div className="container max-w-4xl mx-auto text-center space-y-8 sm:space-y-12">
          <div className="space-y-3 sm:space-y-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
              Transforme sua relação com o dinheiro
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
              Pare de se preocupar com contas atrasadas. Comece a planejar seu futuro financeiro hoje.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 sm:gap-8 pt-4 sm:pt-8">
            <div className="space-y-1 sm:space-y-2">
              <div className="text-3xl sm:text-4xl font-bold">100%</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Gratuito</div>
            </div>
            <div className="space-y-1 sm:space-y-2">
              <div className="text-3xl sm:text-4xl font-bold">2min</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Para começar</div>
            </div>
            <div className="space-y-1 sm:space-y-2">
              <div className="text-3xl sm:text-4xl font-bold">∞</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Transações</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final - ACTION */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 bg-primary text-primary-foreground">
        <div className="container max-w-4xl mx-auto text-center space-y-6 sm:space-y-8">
          <div className="space-y-3 sm:space-y-4">
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight">
              Pronto para começar?
            </h2>
            <p className="text-base sm:text-lg opacity-90 max-w-2xl mx-auto px-4">
              Junte-se a milhares de pessoas que já organizam suas finanças com o Onin
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center">
            <Button
              size="lg"
              variant="secondary"
              className="h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base font-medium rounded-2xl w-full sm:min-w-[200px]"
              onClick={() => navigate("/signup")}
            >
              Começar agora
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base font-medium rounded-2xl w-full sm:min-w-[200px] bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
              onClick={() => navigate("/install")}
            >
              Instalar App
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 sm:py-8 px-4 sm:px-6 border-t">
        <div className="container max-w-6xl mx-auto text-center space-y-3">
          <p className="text-xs sm:text-sm text-muted-foreground">
            © 2024 Onin. Suas finanças na palma da sua mão.
          </p>
          <button 
            onClick={() => navigate("/login")}
            className="text-xs sm:text-sm text-muted-foreground hover:text-foreground underline transition-colors"
          >
            Já tem conta? Faça login
          </button>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
