import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Heart, Search, User, Settings, LogOut, Crown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export const Header = () => {
  const { user, profile, signOut, isAdmin } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // TODO: Implement search functionality
      console.log('Searching for:', searchQuery);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
          <Heart className="w-8 h-8 text-rose-500 fill-current" />
          <h1 className="text-xl font-bold bg-gradient-to-r from-rose-500 to-purple-500 bg-clip-text text-transparent">
            Shorts Dorama
          </h1>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="hidden md:flex items-center space-x-2 flex-1 max-w-md mx-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Buscar doramas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-full border-rose-200 focus:border-rose-400"
            />
          </div>
        </form>

        {/* User Menu */}
        <div className="flex items-center space-x-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10 border-2 border-rose-200">
                    <AvatarImage 
                      src={profile?.avatar_url} 
                      alt={profile?.full_name || user.email} 
                    />
                    <AvatarFallback className="bg-gradient-to-r from-rose-400 to-purple-400 text-white">
                      {(profile?.full_name || user.email)?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium text-gray-900">
                    {profile?.full_name || 'Usuário'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user.email}
                  </p>
                  {isAdmin && (
                    <div className="flex items-center mt-1">
                      <Crown className="w-3 h-3 mr-1 text-yellow-600" />
                      <span className="text-xs text-yellow-600 font-medium">Administrador</span>
                    </div>
                  )}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/subscription')}>
                  <Crown className="mr-2 h-4 w-4" />
                  Meu Plano
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem onClick={() => navigate('/admin')}>
                    <Settings className="mr-2 h-4 w-4" />
                    Painel Admin
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={() => navigate('/subscription')} className="border-rose-300 text-rose-700">
                Plano Premium
              </Button>
              <Button variant="premium" onClick={() => navigate('/auth')}>
                Login
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};