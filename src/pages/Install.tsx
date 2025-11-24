import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Download, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
import logo from "@/assets/logo-onin.png";

const Install = () => {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-4">
          <div className="mx-auto w-24 h-24 rounded-2xl bg-background border-2 border-border flex items-center justify-center p-4">
            <img src={logo} alt="Onin" className="w-full h-full object-contain" />
          </div>
          
          <h1 className="text-3xl font-bold">Instale o Onin</h1>
          
          {isInstalled ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-primary">
                <CheckCircle className="w-5 h-5" />
                <p className="text-lg font-medium">App já instalado!</p>
              </div>
              <p className="text-muted-foreground">
                O Onin está instalado no seu dispositivo. Você pode acessá-lo pela tela inicial.
              </p>
              <Button
                size="lg"
                className="w-full h-14 text-base font-medium rounded-2xl"
                onClick={() => navigate("/dashboard")}
              >
                Ir para o Dashboard
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Instale o Onin no seu celular para ter acesso rápido e usar offline, como um app nativo.
              </p>

              {isInstallable ? (
                <Button
                  size="lg"
                  className="w-full h-14 text-base font-medium rounded-2xl"
                  onClick={handleInstallClick}
                >
                  <Download className="w-5 h-5 mr-2" />
                  Instalar Agora
                </Button>
              ) : (
                <div className="space-y-4 p-6 rounded-2xl bg-muted text-left">
                  <p className="font-medium">Como instalar:</p>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p className="flex items-start gap-2">
                      <span className="font-semibold text-foreground">iPhone:</span>
                      Toque no botão compartilhar e depois em "Adicionar à Tela Inicial"
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="font-semibold text-foreground">Android:</span>
                      Toque no menu do navegador e depois em "Instalar app" ou "Adicionar à tela inicial"
                    </p>
                  </div>
                </div>
              )}

              <Button
                variant="outline"
                size="lg"
                className="w-full h-14 text-base font-medium rounded-2xl"
                onClick={() => navigate("/dashboard")}
              >
                Continuar no navegador
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Install;
