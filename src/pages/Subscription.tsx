import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/Header';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import {
  Check,
  Star,
  ArrowLeft,
  Crown,
  X
} from 'lucide-react';

// Componente para o Modal de Checkout
function CheckoutModal({ checkoutUrl, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg h-full max-h-[90vh] relative flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 z-10"
        >
          <X className="w-6 h-6" />
        </button>
        <iframe
          src={checkoutUrl}
          title="Checkout de Pagamento"
          className="w-full h-full border-0 rounded-lg"
        />
      </div>
    </div>
  );
}


export default function Subscription() {
  const { user, subscription, hasActiveSubscription } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  const handlePaymentClick = async () => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para fazer o pagamento.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Garante que existe uma assinatura pendente antes de abrir o checkout
      // Isso é útil para rastrear quem iniciou um pagamento
      const { data, error: fetchError } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows found
        throw fetchError;
      }

      if (!data) {
        const { error: insertError } = await supabase
          .from('subscriptions')
          .insert({
            user_id: user.id,
            email: user.email,
            status: 'pending'
          });
        if (insertError) throw insertError;
      }

      // Abre o modal de checkout
      setShowCheckout(true);

    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível iniciar o pagamento. Tente novamente.",
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
    <>
      {/* O Modal de Checkout será renderizado aqui quando showCheckout for true */}
      {showCheckout && (
        <CheckoutModal
          checkoutUrl={`https://pay.shortsdorama.shop/index.php?email=${encodeURIComponent(user.email)}`}
          onClose={() => setShowCheckout(false)}
        />
      )}

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
                    Seu plano está ativo até:{' '}
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
              <div className="grid md:grid-cols-2 gap-8 items-start">
                {/* Card do Plano Premium */}
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

                {/* Card de Pagamento */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl text-rose-900">
                      Ative seu Plano
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="bg-rose-50 p-4 rounded-lg text-center">
                      <h3 className="font-semibold text-rose-900 mb-2">
                        Pagamento Seguro via Mercado Pago
                      </h3>
                      <p className="text-sm text-rose-800 mb-4">
                        Clique no botão abaixo para abrir a tela de pagamento e pagar com PIX. Sua assinatura será ativada automaticamente.
                      </p>
                      <Button
                        onClick={handlePaymentClick}
                        disabled={isSubmitting}
                        className="w-full"
                        variant="premium"
                      >
                        {isSubmitting ? 'Aguarde...' : 'Fazer Pagamento'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
