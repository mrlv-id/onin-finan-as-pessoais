import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ArrowRight, ArrowLeft, User, DollarSign, Camera } from "lucide-react";

const Onboarding = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setCurrency: setUserCurrency } = useCurrency();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  // Form data
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState("BRL");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/login");
      return;
    }
    
    // Check if onboarding already completed
    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_completed, name")
      .eq("user_id", user.id)
      .single();

    if (profile?.onboarding_completed) {
      navigate("/dashboard");
      return;
    }

    setUserId(user.id);
    if (profile?.name) {
      setName(profile.name);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNext = async () => {
    if (step === 1) {
      if (!name.trim()) {
        toast({
          title: "Nome obrigatório",
          description: "Por favor, insira seu nome",
          variant: "destructive",
        });
        return;
      }
      
      setLoading(true);
      const { error } = await supabase
        .from("profiles")
        .update({ name: name.trim() })
        .eq("user_id", userId);

      setLoading(false);

      if (error) {
        toast({
          title: "Erro ao salvar nome",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      setStep(2);
    } else if (step === 2) {
      setLoading(true);
      const { error } = await supabase
        .from("profiles")
        .update({ currency })
        .eq("user_id", userId);

      setLoading(false);

      if (error) {
        toast({
          title: "Erro ao salvar moeda",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      // Atualizar o contexto de moeda
      setUserCurrency(currency as "BRL" | "USD" | "EUR");
      
      setStep(3);
    } else if (step === 3) {
      await completeOnboarding();
    }
  };

  const completeOnboarding = async () => {
    setLoading(true);

    let avatarUrl = null;

    // Upload avatar if selected
    if (avatarFile && userId) {
      const fileExt = avatarFile.name.split(".").pop();
      const fileName = `${userId}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, avatarFile);

      if (uploadError) {
        toast({
          title: "Erro ao fazer upload da foto",
          description: uploadError.message,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      avatarUrl = publicUrl;
    }

    // Update profile with avatar and mark onboarding as completed
    const updateData: any = { onboarding_completed: true };
    if (avatarUrl) {
      updateData.avatar_url = avatarUrl;
    }

    const { error } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("user_id", userId);

    setLoading(false);

    if (error) {
      toast({
        title: "Erro ao finalizar onboarding",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Perfil configurado!",
      description: "Bem-vindo ao Onin",
    });

    navigate("/dashboard");
  };

  const currencyOptions = [
    { value: "BRL", label: "Real (R$)", symbol: "R$" },
    { value: "USD", label: "Dólar ($)", symbol: "$" },
    { value: "EUR", label: "Euro (€)", symbol: "€" },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-background">
      <div className="w-full max-w-md space-y-8">
        {/* Progress indicator */}
        <div className="flex justify-center gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 w-16 rounded-full transition-colors ${
                s === step ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">
            {step === 1 && "Qual é o seu nome?"}
            {step === 2 && "Escolha sua moeda"}
            {step === 3 && "Adicione uma foto"}
          </h1>
          <p className="text-muted-foreground">
            {step === 1 && "Como você gostaria de ser chamado?"}
            {step === 2 && "Selecione a moeda que deseja usar no app"}
            {step === 3 && "Personalize seu perfil (opcional)"}
          </p>
        </div>

        <div className="space-y-6">
          {/* Step 1: Name */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-10 h-10 text-primary" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                  className="h-12 text-center text-lg"
                  autoFocus
                />
              </div>
            </div>
          )}

          {/* Step 2: Currency */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <DollarSign className="w-10 h-10 text-primary" />
                </div>
              </div>
              <div className="grid gap-3">
                {currencyOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setCurrency(option.value)}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      currency === option.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{option.label}</div>
                        <div className="text-sm text-muted-foreground">
                          Símbolo: {option.symbol}
                        </div>
                      </div>
                      {currency === option.value && (
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Avatar */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <Avatar className="w-32 h-32">
                    {avatarPreview ? (
                      <AvatarImage src={avatarPreview} />
                    ) : (
                      <AvatarFallback className="bg-primary/10">
                        <Camera className="w-12 h-12 text-primary" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <label
                    htmlFor="avatar"
                    className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-primary flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors"
                  >
                    <Camera className="w-5 h-5 text-primary-foreground" />
                  </label>
                  <input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </div>
              </div>
              <p className="text-center text-sm text-muted-foreground">
                Você pode pular esta etapa e adicionar depois
              </p>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex gap-3 pt-4">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                disabled={loading}
                className="flex-1 h-12"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            )}
            <Button
              onClick={handleNext}
              disabled={loading}
              className="flex-1 h-12"
            >
              {loading ? (
                "Salvando..."
              ) : step === 3 ? (
                "Finalizar"
              ) : (
                <>
                  Continuar
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
