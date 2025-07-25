import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Lock, Check } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  price: number;
  views_count: number;
  is_active: boolean;
}

interface VideoCardProps {
  video: Video;
  hasPurchased?: boolean;
  onPurchase?: (videoId: string) => void;
  onWatch?: (videoId: string) => void;
}

export const VideoCard = ({ video, hasPurchased = false, onPurchase, onWatch }: VideoCardProps) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = async () => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Faça login para assistir aos vídeos.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    if (hasPurchased) {
      onWatch?.(video.id);
    } else {
      onPurchase?.(video.id);
    }
    
    setIsLoading(false);
  };

  const formatPrice = (price: number) => {
    return `R$ ${(price / 100).toFixed(2).replace('.', ',')}`;
  };

  return (
    <Card className="group overflow-hidden border-0 bg-card shadow-card-dorama hover:shadow-romantic transition-all duration-300 hover:scale-[1.02]">
      <div className="relative aspect-video overflow-hidden">
        <img
          src={video.thumbnail_url}
          alt={video.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/placeholder.svg';
          }}
        />
        
        {/* Overlay with play button */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
            {hasPurchased ? (
              <Play className="w-8 h-8 text-white" />
            ) : (
              <Lock className="w-8 h-8 text-white" />
            )}
          </div>
        </div>

        {/* Status badge */}
        {hasPurchased && (
          <Badge className="absolute top-3 right-3 bg-dorama-pink text-primary-foreground">
            <Check className="w-3 h-3 mr-1" />
            Adquirido
          </Badge>
        )}
      </div>

      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-lg text-foreground line-clamp-2 group-hover:text-dorama-pink transition-colors">
            {video.title}
          </h3>
          {video.description && (
            <p className="text-muted-foreground text-sm line-clamp-2 mt-1">
              {video.description}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {video.views_count.toLocaleString()} visualizações
          </div>
          <div className="font-bold text-dorama-pink">
            {formatPrice(video.price)}
          </div>
        </div>

        <Button
          variant={hasPurchased ? "romantic" : "watch"}
          size="lg"
          className="w-full"
          onClick={handleAction}
          disabled={isLoading}
        >
          {isLoading ? (
            "Carregando..."
          ) : hasPurchased ? (
            <>
              <Play className="w-4 h-4 mr-2" />
              Assistir Agora
            </>
          ) : (
            <>
              <Lock className="w-4 h-4 mr-2" />
              Assistir por {formatPrice(video.price)}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};