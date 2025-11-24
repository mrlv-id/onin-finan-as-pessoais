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
        <div className="container max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Onin</h2>
          <Button 
            variant="ghost" 
            onClick={() => navigate("/login")}
            className="font-medium"
          >
            Entrar
          </Button>
        </div>
      </header>

      {/* Hero Section - ATTENTION */}
      <section className="pt-32 pb-20 px-6">
        <div className="container max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter">
              Suas Finanças,
              <br />
              <span className="text-muted-foreground">Descomplicadas</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Controle total do seu dinheiro em uma interface simples e poderosa
            </p>
          </div>

          <div className="pt-4">
            <Button
              size="lg"
              className="h-14 px-8 text-base font-medium rounded-2xl group"
              onClick={() => navigate("/signup")}
            >
              Começar jornada
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section - INTEREST & DESIRE */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Tudo que você precisa
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Ferramentas essenciais para organizar sua vida financeira
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="p-6 rounded-2xl border bg-card hover:shadow-lg transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-primary">
                      <Icon className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <h3 className="text-xl font-semibold">{feature.title}</h3>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section - DESIRE */}
      <section className="py-20 px-6">
        <div className="container max-w-4xl mx-auto text-center space-y-12">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Transforme sua relação com o dinheiro
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Pare de se preocupar com contas atrasadas. Comece a planejar seu futuro financeiro hoje.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 pt-8">
            <div className="space-y-2">
              <div className="text-4xl font-bold">100%</div>
              <div className="text-sm text-muted-foreground">Gratuito</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold">2min</div>
              <div className="text-sm text-muted-foreground">Para começar</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold">∞</div>
              <div className="text-sm text-muted-foreground">Transações</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final - ACTION */}
      <section className="py-20 px-6 bg-primary text-primary-foreground">
        <div className="container max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              Pronto para começar?
            </h2>
            <p className="text-lg opacity-90 max-w-2xl mx-auto">
              Junte-se a milhares de pessoas que já organizam suas finanças com o Onin
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              variant="secondary"
              className="h-14 px-8 text-base font-medium rounded-2xl min-w-[200px]"
              onClick={() => navigate("/signup")}
            >
              Começar agora
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-14 px-8 text-base font-medium rounded-2xl min-w-[200px] bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
              onClick={() => navigate("/login")}
            >
              Já tenho conta
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t">
        <div className="container max-w-6xl mx-auto text-center text-sm text-muted-foreground">
          <p>© 2024 Onin. Suas finanças na palma da sua mão.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
