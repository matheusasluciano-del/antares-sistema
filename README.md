# Antares — Stock Flow

Sistema de gestão da Antares: estoque com status colorido, dashboard,
entradas e saídas (fluxo de caixa), calculadora de precificação e equipe.

## 1. Instalar dependências

```
bun install
```
(ou `npm install`, se preferir)

## 2. Configurar o banco (Supabase)

1. No painel do seu projeto Supabase, vá em **SQL Editor > New query**.
2. Cole todo o conteúdo do arquivo `supabase/schema.sql` e clique em **Run**.
   Isso cria as tabelas, os enums, o RLS e o trigger que gera o "profile"
   automaticamente quando alguém se cadastra.
3. Vá em **Storage > New bucket**, crie um bucket chamado `produtos` e marque
   como **público** (é onde ficam as fotos das peças).
4. Vá em **Authentication > Users > Add user** e crie o seu usuário
   (e-mail + senha).
5. Volte no SQL Editor e rode, trocando pelo seu e-mail:
   ```sql
   insert into user_roles (user_id, role)
   select id, 'admin' from auth.users where email = 'seuemail@antares.com';
   ```
   Isso te torna administrador do sistema.

## 3. Configurar variáveis de ambiente

Copie `.env.example` para `.env` e preencha com os dados do seu projeto
(**Project Settings > API Keys**):

```
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

## 4. Rodar localmente

```
bun run dev
```

Abra o endereço mostrado no terminal e faça login com o usuário criado no
passo 2.4.

## 5. Publicar

```
bun run build
```

Isso gera a pasta `dist/`, que pode ser publicada em qualquer host estático
(Cloudflare Pages, Vercel, Netlify).
