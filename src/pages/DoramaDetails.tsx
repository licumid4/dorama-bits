import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/Header';
import { ArrowLeft, Play, Lock } from 'lucide-react';

export default function DoramaDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, hasActiveSubscription } = useAuth();

  const { data: dorama, isLoading } = useQuery({
    queryKey: ['dorama', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-pink-200 rounded mb-4 w-1/4"></div>
            <div className="h-64 bg-pink-200 rounded mb-6"></div>
            <div className="h-6 bg-pink-200 rounded mb-2 w-3/4"></div>
            <div className="h-4 bg-pink-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!dorama) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-rose-900 mb-4">Dorama não encontrado</h1>
          <Button onClick={() => navigate('/')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para início
          </Button>
        </div>
      </div>
    );
  }

  const canWatch = user && hasActiveSubscription;

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <Button 
          onClick={() => navigate('/')} 
          variant="ghost" 
          className="mb-6 text-rose-700 hover:text-rose-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para doramas
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Player/Thumbnail */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                {canWatch ? (
                  <div className="aspect-video bg-black">
                    <iframe
                      src={dorama.video_url}
                      className="w-full h-full"
                      allowFullScreen
                      title={dorama.title}
                    />
                  </div>
                ) : (
                  <div className="aspect-video relative bg-gradient-to-br from-rose-900 to-purple-900">
                    <img
                      src={dorama.thumbnail_url}
                      alt={dorama.title}
                      className="w-full h-full object-cover opacity-50"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <div className="text-center text-white">
                        <Lock className="w-16 h-16 mx-auto mb-4 opacity-80" />
                        <h3 className="text-xl font-semibold mb-2">Conteúdo Exclusivo</h3>
                        <p className="mb-4 opacity-90">
                          {!user ? 'Faça login para assistir' : 'Ative seu plano para assistir'}
                        </p>
                        {!user ? (
                          <Button 
                            onClick={() => navigate('/auth')}
                            variant="premium"
                          >
                            Fazer Login
                          </Button>
                        ) : (
                          <Button 
                            onClick={() => navigate('/subscription')}
                            variant="premium"
                          >
                            Ativar Plano
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Info */}
          <div>
            <Card>
              <CardContent className="p-6">
                <h1 className="text-2xl font-bold text-rose-900 mb-3">
                  {dorama.title}
                </h1>
                
                {dorama.tags && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {dorama.tags.map((tag: string, index: number) => (
                      <Badge key={index} variant="secondary" className="bg-rose-100 text-rose-700">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                <p className="text-gray-600 mb-6 leading-relaxed">
                  {dorama.description}
                </p>

                <div className="text-sm text-gray-500 mb-4">
                  <span className="inline-flex items-center">
                    <Play className="w-4 h-4 mr-1" />
                    {dorama.views_count || 0} visualizações
                  </span>
                </div>

                {canWatch && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center text-green-700">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      <span className="font-medium">Plano Ativo</span>
                    </div>
                    <p className="text-sm text-green-600 mt-1">
                      Aproveite todos os doramas sem limitações!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}