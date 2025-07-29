import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/Header';
import { DoramaCard } from '@/components/DoramaCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Heart, Play, Crown, Search, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import heroImage from '@/assets/hero-dorama.jpg';

interface Video {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string;
  tags: string[] | null;
  views_count: number | null;
  is_active: boolean | null;
}

const Index = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch doramas from Supabase
  const { data: videos = [], isLoading } = useQuery({
    queryKey: ['doramas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Video[];
    },
  });

  const filteredVideos = videos.filter(video =>
    video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    video.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    video.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
      <Header />

      {/* Hero Section */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-black/40" />
        
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
          <div className="flex justify-center mb-6">
            <Heart className="w-16 h-16 text-rose-400 fill-current animate-pulse" />
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-rose-400 to-purple-400 bg-clip-text text-transparent">
            Shorts Dorama
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 text-white/90">
            Descubra momentos românticos inesquecíveis
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button variant="premium" size="lg" className="text-lg px-8 py-6">
              <Play className="w-5 h-5 mr-2" />
              Começar a Assistir
            </Button>
            
            <div className="flex items-center text-white/80">
              <Crown className="w-5 h-5 mr-2 text-yellow-400" />
              <span>Plano Premium R$ 20,00/mês</span>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold text-rose-900">
              Doramas em Destaque
            </h2>
            <Badge variant="secondary" className="bg-rose-100 text-rose-700">
              {videos.length} doramas disponíveis
            </Badge>
          </div>

          <div className="flex items-center space-x-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Buscar doramas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-full border-rose-200 focus:border-rose-400"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Doramas Grid */}
        {isLoading ? (
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 place-items-center">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-lg overflow-hidden animate-pulse w-80">
                <div className="w-80 h-96 bg-gray-300"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 place-items-center">
            {filteredVideos.map((video) => (
              <DoramaCard key={video.id} video={video} />
            ))}
          </div>
        )}

        {filteredVideos.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Nenhum dorama encontrado
            </h3>
            <p className="text-gray-500">
              Tente ajustar sua busca ou explore nossos doramas em destaque
            </p>
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="bg-gradient-to-r from-rose-50 to-purple-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-rose-900 mb-4">
              Por que escolher Shorts Dorama?
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              A melhor experiência em doramas românticos com acesso ilimitado
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-rose-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-rose-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Conteúdo Romântico</h3>
              <p className="text-gray-600">
                Vídeos cuidadosamente selecionados dos melhores doramas românticos
              </p>
            </div>

            <div className="text-center">
              <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Crown className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Acesso Ilimitado</h3>
              <p className="text-gray-600">
                Plano mensal de R$ 20,00 com acesso a todos os doramas
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Play className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Alta Qualidade</h3>
              <p className="text-gray-600">
                Vídeos em alta definição sem anúncios para a melhor experiência
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
