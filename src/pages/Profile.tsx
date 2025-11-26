import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { User } from "@supabase/supabase-js";
import { useCurrency } from "@/contexts/CurrencyContext";
import Navigation from "@/components/Navigation";
import FAB from "@/components/FAB";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { signOut } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "next-themes";
import { Moon, Sun, Camera, Loader2, DollarSign, Bell } from "lucide-react";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageCropDialog } from "@/components/ImageCropDialog";
const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const { isEnabled: pushEnabled, toggle: togglePush } = usePushNotifications();
  const { currency, setCurrency } = useCurrency();
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nameTimeoutRef = useRef<NodeJS.Timeout>();
  const initialNameRef = useRef<string>("");
  const hasUserEditedRef = useRef(false);
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: {
          session
        }
      } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }
      setUser(session.user);
      const initialName = session.user.user_metadata?.name || "";
      setName(initialName);
      initialNameRef.current = initialName;
      hasUserEditedRef.current = false;
      
      // Load profile data including avatar
      const { data: profile } = await supabase
        .from("profiles")
        .select("avatar_url")
        .eq("user_id", session.user.id)
        .single();
      
      if (profile?.avatar_url) {
        setAvatarUrl(profile.avatar_url);
      }
    };
    checkAuth();
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange((_, session) => {
      if (!session) {
        navigate("/login");
      } else {
        setUser(session.user);
        const initialName = session.user.user_metadata?.name || "";
        setName(initialName);
        initialNameRef.current = initialName;
        hasUserEditedRef.current = false;
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  // Auto-save name with debounce
  useEffect(() => {
    if (!user || !name) return;
    
    // Skip if this is the initial load (name hasn't been edited by user)
    if (name === initialNameRef.current && !hasUserEditedRef.current) return;
    
    // Clear previous timeout
    if (nameTimeoutRef.current) {
      clearTimeout(nameTimeoutRef.current);
    }
    
    // Set new timeout to save after 1 second of no typing
    nameTimeoutRef.current = setTimeout(async () => {
      try {
        const { error } = await supabase
          .from("profiles")
          .update({ name })
          .eq("user_id", user.id);
        
        if (error) throw error;
        
        toast({
          title: "Nome atualizado",
          description: "Seu nome foi salvo automaticamente.",
        });
      } catch (error) {
        console.error("Error updating name:", error);
        toast({
          title: "Erro ao atualizar",
          description: "Não foi possível salvar o nome.",
          variant: "destructive",
        });
      }
    }, 1000);
    
    return () => {
      if (nameTimeoutRef.current) {
        clearTimeout(nameTimeoutRef.current);
      }
    };
  }, [name, user, toast]);
  const handleAvatarSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    
    const file = event.target.files[0];
    const reader = new FileReader();
    
    reader.onload = () => {
      setImageToCrop(reader.result as string);
      setCropDialogOpen(true);
    };
    
    reader.readAsDataURL(file);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCroppedImage = async (croppedImageBlob: Blob) => {
    if (!user) return;
    
    setIsUploading(true);
    
    try {
      // Delete old avatar if exists
      if (avatarUrl) {
        const oldPath = avatarUrl.split('/').pop();
        if (oldPath) {
          await supabase.storage
            .from('avatars')
            .remove([`${user.id}/${oldPath}`]);
        }
      }
      
      // Upload new avatar
      const fileName = `${Math.random()}.jpg`;
      const filePath = `${user.id}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, croppedImageBlob, {
          contentType: 'image/jpeg',
          upsert: true
        });
      
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', user.id);
      
      if (updateError) throw updateError;
      
      setAvatarUrl(publicUrl);
      toast({
        title: "Foto atualizada",
        description: "Sua foto de perfil foi salva automaticamente.",
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Erro ao fazer upload",
        description: "Não foi possível atualizar a foto.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const handleCurrencyChange = async (newCurrency: string) => {
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({ currency: newCurrency })
      .eq("user_id", user.id);

    if (error) {
      toast({
        title: "Erro ao alterar moeda",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setCurrency(newCurrency as "BRL" | "USD" | "EUR");
    toast({
      title: "Moeda atualizada",
      description: "A moeda foi alterada com sucesso.",
    });
  };

  const handleTestNotification = async () => {
    if (!pushEnabled) {
      toast({
        title: "Notificações desativadas",
        description: "Ative as notificações push primeiro.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.functions.invoke('send-test-notification');
      
      if (error) throw error;

      toast({
        title: "Notificação enviada",
        description: "Verifique sua notificação de teste!",
      });
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a notificação de teste.",
        variant: "destructive",
      });
    }
  };
  const initials = name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  return <div className="min-h-screen pb-20">
      <div className="container max-w-md mx-auto px-6 pt-8 space-y-8 animate-fade-in">
        <h1 className="text-3xl font-bold text-center">Perfil</h1>

        <div className="flex flex-col items-center space-y-4">
          <div className="relative group">
            <Avatar className="w-24 h-24 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              {avatarUrl && <AvatarImage src={avatarUrl} alt={name} />}
              <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
            </Avatar>
            <div 
              className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              {isUploading ? (
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              ) : (
                <Camera className="w-6 h-6 text-white" />
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarSelect}
              disabled={isUploading}
            />
          </div>

          <div className="w-full space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input 
                id="name" 
                value={name} 
                onChange={e => {
                  setName(e.target.value);
                  hasUserEditedRef.current = true;
                }} 
                className="h-12"
                placeholder="Digite seu nome"
              />
              <p className="text-xs text-muted-foreground">
                Salvo automaticamente
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user?.email || ""} disabled className="h-12" />
            </div>
          </div>
        </div>

        <div className="pt-8 space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div className="flex items-center space-x-3">
              {theme === "dark" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              <Label className="text-base font-medium">Tema Escuro</Label>
            </div>
            <Switch checked={theme === "dark"} onCheckedChange={checked => setTheme(checked ? "dark" : "light")} />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div className="flex items-center space-x-3">
              <DollarSign className="w-5 h-5" />
              <Label className="text-base font-medium">Moeda</Label>
            </div>
            <Select value={currency} onValueChange={handleCurrencyChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BRL">Real (R$)</SelectItem>
                <SelectItem value="USD">Dólar (US$)</SelectItem>
                <SelectItem value="EUR">Euro (€)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div className="space-y-1">
                <Label className="text-base font-medium">Notificações Push</Label>
                <p className="text-xs text-muted-foreground">
                  Receba lembretes quando suas contas estiverem próximas do vencimento
                </p>
              </div>
              <Switch checked={pushEnabled} onCheckedChange={togglePush} />
            </div>
            
            {pushEnabled && (
              <Button 
                variant="outline" 
                className="w-full h-12" 
                onClick={handleTestNotification}
              >
                <Bell className="w-4 h-4 mr-2" />
                Testar Notificação
              </Button>
            )}
          </div>

          <Button variant="outline" className="w-full h-12" onClick={handleLogout}>
            Sair da conta
          </Button>
        </div>
      </div>

      <FAB />
      <Navigation />
      
      {imageToCrop && (
        <ImageCropDialog
          open={cropDialogOpen}
          onOpenChange={setCropDialogOpen}
          imageSrc={imageToCrop}
          onCropComplete={handleCroppedImage}
        />
      )}
    </div>;
};
export default Profile;