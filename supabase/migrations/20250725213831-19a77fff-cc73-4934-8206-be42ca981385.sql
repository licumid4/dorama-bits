-- Criar tabela de perfis de usuário
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Usuários podem ver seus próprios perfis" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios perfis" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios perfis" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins podem ver todos os perfis" ON public.profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Criar tabela de vídeos
CREATE TABLE public.videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT NOT NULL,
  embed_code TEXT NOT NULL,
  price INTEGER DEFAULT 1000, -- R$ 10,00 em centavos
  is_active BOOLEAN DEFAULT true,
  views_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES public.profiles(user_id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS para vídeos
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- Políticas para vídeos
CREATE POLICY "Todos podem ver vídeos ativos" ON public.videos
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins podem gerenciar vídeos" ON public.videos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Criar tabela de compras
CREATE TABLE public.purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'expired')),
  payment_reference TEXT UNIQUE,
  yampi_transaction_id TEXT,
  amount INTEGER NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, video_id)
);

-- Habilitar RLS para compras
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

-- Políticas para compras
CREATE POLICY "Usuários podem ver suas próprias compras" ON public.purchases
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Sistema pode inserir compras" ON public.purchases
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Sistema pode atualizar compras" ON public.purchases
  FOR UPDATE USING (true);

CREATE POLICY "Admins podem ver todas as compras" ON public.purchases
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Criar tabela de logs administrativos
CREATE TABLE public.admin_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS para logs
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

-- Políticas para logs administrativos
CREATE POLICY "Admins podem ver logs" ON public.admin_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Sistema pode inserir logs" ON public.admin_logs
  FOR INSERT WITH CHECK (true);

-- Função para criar perfil automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$;

-- Trigger para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_videos_updated_at
  BEFORE UPDATE ON public.videos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_purchases_updated_at
  BEFORE UPDATE ON public.purchases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Função para verificar acesso a vídeo
CREATE OR REPLACE FUNCTION public.has_video_access(video_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.purchases
    WHERE video_id = video_uuid 
    AND user_id = user_uuid 
    AND status = 'paid'
    AND (expires_at IS NULL OR expires_at > now())
  );
END;
$$;