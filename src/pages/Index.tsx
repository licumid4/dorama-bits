import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/Header';
import { VideoCard } from '@/components/VideoCard';
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
  description: string;
  thumbnail_url: string;
  price: number;
  views_count: number;
  is_active: boolean;
}

const Index = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [purchasedVideos, setPurchasedVideos] = useState<string[]>([]);

  // Fetch videos
  const { data: videos = [], isLoading } = useQuery({
    queryKey: ['videos'],
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

  // Fetch user's purchased videos
  useEffect(() => {
    if (user) {
      const fetchPurchasedVideos = async () => {
        const { data } = await supabase
          .from('purchases')
          .select('video_id')
          .eq('user_id', user.id)
          .eq('status', 'paid');

        if (data) {
          setPurchasedVideos(data.map(p => p.video_id));
        }
      };

      fetchPurchasedVideos();
    }
  }, [user]);

  const handlePurchase = async (videoId: string) => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Faça login para comprar vídeos.",
        variant: "destructive",
      });
      return;
    }

    // Simulate payment process - In production, integrate with Yampi
    toast({
      title: "Redirecionando para pagamento",
      description: "Você será redirecionado para completar a compra.",
    });
  };

  const handleWatch = (videoId: string) => {
    // TODO: Implement video player modal
    toast({
      title: "Abrindo vídeo",
      description: "Player de vídeo será implementado em breve.",
    });
  };

  const filteredVideos = videos.filter(video =>
    video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    video.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
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
            <Heart className="w-16 h-16 text-dorama-pink fill-current animate-pulse" />
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-romantic bg-clip-text text-transparent">
            Shorts Dorama
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 text-white/90">
            Descubra momentos românticos inesquecíveis em vídeos curtos
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button variant="romantic" size="lg" className="text-lg px-8 py-6">
              <Play className="w-5 h-5 mr-2" />
              Começar a Assistir
            </Button>
            
            <div className="flex items-center text-white/80">
              <Crown className="w-5 h-5 mr-2 text-dorama-gold" />
              <span>Vídeos por apenas R$ 10,00</span>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold text-foreground">
              Doramas em Destaque
            </h2>
            <Badge variant="secondary" className="bg-dorama-pink-light text-dorama-purple">
              {videos.length} vídeos disponíveis
            </Badge>
          </div>

          <div className="flex items-center space-x-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Buscar doramas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-full border-dorama-pink/20 focus:border-dorama-pink"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Videos Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-video bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredVideos.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                hasPurchased={purchasedVideos.includes(video.id)}
                onPurchase={handlePurchase}
                onWatch={handleWatch}
              />
            ))}
          </div>
        )}

        {filteredVideos.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Nenhum vídeo encontrado
            </h3>
            <p className="text-muted-foreground">
              Tente ajustar sua busca ou explore nossos vídeos em destaque
            </p>
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="bg-gradient-to-r from-dorama-pink-light/20 to-dorama-lavender/20 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Por que escolher Shorts Dorama?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              A melhor experiência em doramas românticos com pagamento justo por conteúdo
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-dorama-pink/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-dorama-pink" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Conteúdo Romântico</h3>
              <p className="text-muted-foreground">
                Vídeos cuidadosamente selecionados dos melhores doramas românticos
              </p>
            </div>

            <div className="text-center">
              <div className="bg-dorama-gold/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Crown className="w-8 h-8 text-dorama-gold" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Preço Justo</h3>
              <p className="text-muted-foreground">
                Pague apenas pelo que assistir. Cada vídeo por apenas R$ 10,00
              </p>
            </div>

            <div className="text-center">
              <div className="bg-dorama-purple/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Play className="w-8 h-8 text-dorama-purple" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Alta Qualidade</h3>
              <p className="text-muted-foreground">
                Vídeos em alta definição para a melhor experiência de viewing
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
