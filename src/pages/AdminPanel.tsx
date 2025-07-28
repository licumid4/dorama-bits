import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Header } from '@/components/Header';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Check, 
  X, 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  Video,
  CreditCard
} from 'lucide-react';

export default function AdminPanel() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form states
  const [newDorama, setNewDorama] = useState({
    title: '',
    description: '',
    thumbnail_url: '',
    video_url: '',
    tags: ''
  });

  // Fetch pending subscriptions
  const { data: pendingSubscriptions, refetch: refetchSubscriptions } = useQuery({
    queryKey: ['pending-subscriptions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  // Fetch all doramas
  const { data: doramas, refetch: refetchDoramas } = useQuery({
    queryKey: ['admin-doramas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-rose-900 mb-4">
            Acesso negado
          </h1>
          <p className="text-gray-600 mb-4">
            Você não tem permissão para acessar esta página.
          </p>
          <Button onClick={() => navigate('/')} variant="outline">
            Voltar para início
          </Button>
        </div>
      </div>
    );
  }

  const handleApproveSubscription = async (subscriptionId: string) => {
    setIsSubmitting(true);
    try {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + 30);

      const { error } = await supabase
        .from('subscriptions')
        .update({
          status: 'active',
          starts_at: startDate.toISOString(),
          expires_at: endDate.toISOString(),
          approved_by: user.id,
          approved_at: new Date().toISOString()
        })
        .eq('id', subscriptionId);

      if (error) throw error;

      toast({
        title: "Plano aprovado!",
        description: "O usuário agora tem acesso por 30 dias.",
      });

      refetchSubscriptions();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao aprovar plano.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectSubscription = async (subscriptionId: string) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({
          status: 'cancelled'
        })
        .eq('id', subscriptionId);

      if (error) throw error;

      toast({
        title: "Plano rejeitado",
        description: "A solicitação foi rejeitada.",
      });

      refetchSubscriptions();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao rejeitar plano.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateDorama = async () => {
    if (!newDorama.title || !newDorama.thumbnail_url || !newDorama.video_url) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha título, thumbnail e URL do vídeo.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const tags = newDorama.tags ? newDorama.tags.split(',').map(tag => tag.trim()) : [];

      const { error } = await supabase
        .from('videos')
        .insert({
          title: newDorama.title,
          description: newDorama.description,
          thumbnail_url: newDorama.thumbnail_url,
          video_url: newDorama.video_url,
          embed_code: newDorama.video_url, // Use video_url as embed_code for compatibility
          tags: tags,
          created_by: user.id
        });

      if (error) throw error;

      toast({
        title: "Dorama criado!",
        description: "O novo dorama foi adicionado com sucesso.",
      });

      setNewDorama({
        title: '',
        description: '',
        thumbnail_url: '',
        video_url: '',
        tags: ''
      });

      refetchDoramas();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar dorama.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDorama = async (doramaId: string) => {
    if (!confirm('Tem certeza que deseja excluir este dorama?')) return;

    try {
      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', doramaId);

      if (error) throw error;

      toast({
        title: "Dorama excluído",
        description: "O dorama foi removido com sucesso.",
      });

      refetchDoramas();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir dorama.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-rose-900 mb-2">
            Painel Administrativo
          </h1>
          <p className="text-gray-600">
            Gerencie doramas e aprovações de planos
          </p>
        </div>

        <Tabs defaultValue="subscriptions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="subscriptions" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Aprovações de Planos
            </TabsTrigger>
            <TabsTrigger value="doramas" className="flex items-center gap-2">
              <Video className="w-4 h-4" />
              Gerenciar Doramas
            </TabsTrigger>
          </TabsList>

          {/* Tab de Aprovações */}
          <TabsContent value="subscriptions">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Solicitações Pendentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pendingSubscriptions && pendingSubscriptions.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Usuário</TableHead>
                        <TableHead>WhatsApp</TableHead>
                        <TableHead>Comprovante</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingSubscriptions.map((subscription) => (
                        <TableRow key={subscription.id}>
                        <TableCell>
                          <div>
                            <div className="text-sm text-gray-500">
                              ID: {subscription.user_id.slice(0, 8)}...
                            </div>
                          </div>
                        </TableCell>
                          <TableCell>{subscription.whatsapp_number}</TableCell>
                          <TableCell>
                            {subscription.payment_proof_url ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(subscription.payment_proof_url, '_blank')}
                              >
                                Ver Comprovante
                              </Button>
                            ) : (
                              <span className="text-gray-400">Sem comprovante</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {new Date(subscription.created_at).toLocaleDateString('pt-BR')}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => handleApproveSubscription(subscription.id)}
                                disabled={isSubmitting}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleRejectSubscription(subscription.id)}
                                disabled={isSubmitting}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Nenhuma solicitação pendente
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab de Doramas */}
          <TabsContent value="doramas" className="space-y-6">
            {/* Criar Novo Dorama */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Adicionar Novo Dorama
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Título *</Label>
                    <Input
                      id="title"
                      value={newDorama.title}
                      onChange={(e) => setNewDorama({...newDorama, title: e.target.value})}
                      placeholder="Título do dorama"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
                    <Input
                      id="tags"
                      value={newDorama.tags}
                      onChange={(e) => setNewDorama({...newDorama, tags: e.target.value})}
                      placeholder="Romance, Drama, Comédia"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={newDorama.description}
                    onChange={(e) => setNewDorama({...newDorama, description: e.target.value})}
                    placeholder="Descrição do dorama..."
                    rows={3}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="thumbnail">URL da Capa *</Label>
                    <Input
                      id="thumbnail"
                      value={newDorama.thumbnail_url}
                      onChange={(e) => setNewDorama({...newDorama, thumbnail_url: e.target.value})}
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="video">URL do Vídeo (Embed) *</Label>
                    <Input
                      id="video"
                      value={newDorama.video_url}
                      onChange={(e) => setNewDorama({...newDorama, video_url: e.target.value})}
                      placeholder="https://youtube.com/embed/..."
                    />
                  </div>
                </div>

                <Button
                  onClick={handleCreateDorama}
                  disabled={isSubmitting}
                  className="w-full md:w-auto"
                >
                  {isSubmitting ? 'Criando...' : 'Criar Dorama'}
                </Button>
              </CardContent>
            </Card>

            {/* Lista de Doramas */}
            <Card>
              <CardHeader>
                <CardTitle>Doramas Existentes</CardTitle>
              </CardHeader>
              <CardContent>
                {doramas && doramas.length > 0 ? (
                  <div className="grid gap-4">
                    {doramas.map((dorama) => (
                      <div key={dorama.id} className="flex items-center gap-4 p-4 border rounded-lg">
                        <img
                          src={dorama.thumbnail_url}
                          alt={dorama.title}
                          className="w-20 h-28 object-cover rounded"
                          style={{ width: '64px', height: '96px' }}
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-rose-900">{dorama.title}</h3>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {dorama.description}
                          </p>
                          {dorama.tags && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {dorama.tags.map((tag: string, index: number) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteDorama(dorama.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Nenhum dorama cadastrado
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}