import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { User } from "@supabase/supabase-js";
import Navigation from "@/components/Navigation";
import FAB from "@/components/FAB";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { signOut } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { usePushNotifications } from "@/hooks/usePushNotifications";
const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const { isEnabled: pushEnabled, toggle: togglePush } = usePushNotifications();
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
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
      setName(session.user.user_metadata?.name || "");
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
        setName(session.user.user_metadata?.name || "");
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);
  const handleSaveProfile = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ name })
        .eq("user_id", user.id);
      
      if (error) throw error;
      
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram salvas com sucesso.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível salvar as alterações.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };
  const initials = name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  return <div className="min-h-screen pb-20">
      <div className="container max-w-md mx-auto px-6 pt-8 space-y-8 animate-fade-in">
        <h1 className="text-3xl font-bold text-center">Perfil</h1>

        <div className="flex flex-col items-center space-y-4">
          <Avatar className="w-24 h-24">
            <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
          </Avatar>

          <div className="w-full space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" value={name} onChange={e => setName(e.target.value)} className="h-12" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user?.email || ""} disabled className="h-12" />
            </div>

            <Button 
              onClick={handleSaveProfile} 
              disabled={isSaving}
              className="w-full h-12"
            >
              {isSaving ? "Salvando..." : "Salvar Alterações"}
            </Button>
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
            <div className="space-y-1">
              <Label className="text-base font-medium">Notificações Push</Label>
              <p className="text-xs text-muted-foreground">
                Receba lembretes quando suas contas estiverem próximas do vencimento
              </p>
            </div>
            <Switch checked={pushEnabled} onCheckedChange={togglePush} />
          </div>

          <Button variant="outline" className="w-full h-12" onClick={handleLogout}>
            Sair da conta
          </Button>
        </div>
      </div>

      <FAB />
      <Navigation />
    </div>;
};
export default Profile;