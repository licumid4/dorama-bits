import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Header } from '@/components/Header';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { 
  Check, 
  Star, 
  MessageCircle, 
  Copy,
  ArrowLeft,
  Crown
} from 'lucide-react';

export default function Subscription() {
  const { user, subscription, hasActiveSubscription } = useAuth();
  const navigate = useNavigate();
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [paymentProofUrl, setPaymentProofUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pixKey = 'd3cbb30a-5a7f-46b8-b922-e44c8f9c4a25';
  const whatsappLink = '(11) 93758-7626';

  const copyPixKey = () => {
    navigator.clipboard.writeText(pixKey);
    toast({
      title: "Chave PIX copiada!",
      description: "Cole no seu aplicativo bancário para fazer o pagamento.",
    });
  };

  const handleSubmitPayment = async () => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para solicitar o plano.",
        variant: "destructive",
      });
      return;
    }

    if (!whatsappNumber || !paymentProofUrl) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o número do WhatsApp e o link do comprovante.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('subscriptions')
        .insert({
          user_id: user.id,
          whatsapp_number: whatsappNumber,
          payment_proof_url: paymentProofUrl,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Solicitação enviada!",
        description: "Sua solicitação de plano foi enviada. Aguarde a aprovação.",
      });

      setWhatsappNumber('');
      setPaymentProofUrl('');
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao enviar solicitação. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-rose-900 mb-4">
            Faça login para ativar seu plano
          </h1>
          <Button onClick={() => navigate('/auth')} variant="premium">
            Fazer Login
          </Button>
        </div>
      </div>
    );
  }

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
          Voltar para início
        </Button>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-rose-900 mb-2">
              Plano Premium Dorama Shorts
            </h1>
            <p className="text-gray-600">
              Acesso ilimitado a todos os doramas e filmes
            </p>
          </div>

          {hasActiveSubscription ? (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-6 text-center">
                <Crown className="w-16 h-16 mx-auto text-green-600 mb-4" />
                <h2 className="text-2xl font-bold text-green-800 mb-2">
                  Plano Ativo!
                </h2>
                <p className="text-green-700 mb-4">
                  Seu plano está ativo até: {' '}
                  {subscription?.expires_at && 
                    new Date(subscription.expires_at).toLocaleDateString('pt-BR')
                  }
                </p>
                <Button onClick={() => navigate('/')} variant="premium">
                  Assistir Doramas
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              {/* Plano Premium */}
              <Card className="border-rose-200 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-gradient-to-l from-rose-500 to-pink-500 text-white px-4 py-1 text-sm font-medium">
                  Mais Popular
                </div>
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl text-rose-900">
                    Plano Premium
                  </CardTitle>
                  <div className="text-4xl font-bold text-rose-700">
                    R$ 20<span className="text-lg font-normal">/mês</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center text-gray-700">
                      <Check className="w-5 h-5 text-green-500 mr-3" />
                      Acesso a todos os doramas
                    </li>
                    <li className="flex items-center text-gray-700">
                      <Check className="w-5 h-5 text-green-500 mr-3" />
                      Acesso a todos os filmes
                    </li>
                    <li className="flex items-center text-gray-700">
                      <Check className="w-5 h-5 text-green-500 mr-3" />
                      Sem anúncios
                    </li>
                    <li className="flex items-center text-gray-700">
                      <Check className="w-5 h-5 text-green-500 mr-3" />
                      Qualidade HD
                    </li>
                    <li className="flex items-center text-gray-700">
                      <Star className="w-5 h-5 text-yellow-500 mr-3" />
                      Conteúdo exclusivo
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Formulário de Pagamento */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-rose-900">
                    Como Ativar seu Plano
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Passo 1 */}
                  <div className="bg-rose-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-rose-900 mb-2 flex items-center">
                      <span className="bg-rose-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">1</span>
                      Faça o pagamento via PIX
                    </h3>
                    <div className="bg-white p-3 rounded border border-rose-200">
                      <p className="text-sm text-gray-600 mb-2">Chave PIX:</p>
                      <div className="flex items-center justify-between bg-gray-50 p-2 rounded text-sm font-mono">
                        <span className="break-all">{pixKey}</span>
                        <Button
                          onClick={copyPixKey}
                          size="sm"
                          variant="outline"
                          className="ml-2"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Passo 2 */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
                      <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">2</span>
                      Envie o comprovante
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="whatsapp">Seu WhatsApp</Label>
                        <Input
                          id="whatsapp"
                          placeholder="(11) 99999-9999"
                          value={whatsappNumber}
                          onChange={(e) => setWhatsappNumber(e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="proof">Link do Comprovante</Label>
                        <Input
                          id="proof"
                          placeholder="Cole o link da imagem do comprovante"
                          value={paymentProofUrl}
                          onChange={(e) => setPaymentProofUrl(e.target.value)}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Suba a imagem no Google Drive, Imgur ou similar e cole o link
                        </p>
                      </div>

                      <Button
                        onClick={handleSubmitPayment}
                        disabled={isSubmitting}
                        className="w-full"
                        variant="premium"
                      >
                        {isSubmitting ? 'Enviando...' : 'Solicitar Ativação'}
                      </Button>
                    </div>
                  </div>

                  {/* Passo 3 */}
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-green-900 mb-2 flex items-center">
                      <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">3</span>
                      Confirmação via WhatsApp
                    </h3>
                    <p className="text-sm text-green-800 mb-2">
                      Envie também o comprovante para nosso WhatsApp:
                    </p>
                    <div className="flex items-center">
                      <MessageCircle className="w-4 h-4 text-green-600 mr-2" />
                      <span className="font-medium text-green-900">{whatsappLink}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}