import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Menu, LogOut, User } from "lucide-react";
import { Link } from "wouter";

interface HeaderProps {
  onToggleSidebar: () => void;
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-wine-light/20 backdrop-blur-xl bg-gradient-to-r from-black via-oled-gray to-black shadow-lg shadow-wine-light/10">
      <div className="mx-auto flex h-16 max-w-full items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-zinc-400 hover:text-yellow-400 transition-colors"
            onClick={onToggleSidebar}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden shadow-lg shadow-wine-light/20 ring-2 ring-wine-light/30 bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center">
              <span className="text-lg font-bold text-black">S</span>
            </div>
            <div className="flex flex-col">
              <div className="text-xl font-bold tracking-tight text-amber-400">
                SOSA
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Link href="/profile">
            <div className="hidden sm:flex items-center gap-3 bg-oled-gray/50 rounded-xl px-3 py-2 border border-wine-light/20 hover:border-wine-light/40 transition-colors cursor-pointer">
            <div className="w-8 h-8 bg-gradient-to-br from-gold to-gold-light rounded-full flex items-center justify-center shadow-md overflow-hidden">
              {user?.profileImageUrl ? (
                <img 
                  src={user.profileImageUrl} 
                  alt="Foto do perfil" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // If image fails to load, hide it and show default icon
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <User className="h-4 w-4 text-black" />
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gold-light">{user?.firstName || user?.email?.split('@')[0] || 'Usuário'}</span>
            </div>
            </div>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={logout}
            className="flex items-center gap-2 rounded-xl border-red-500/30 bg-red-950/30 text-red-400 hover:bg-red-900/50 hover:text-red-300 transition-all duration-300"
            data-testid="button-logout"
          >
            <LogOut className="h-4 w-4" />
            <span>Sair</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
