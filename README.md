Monitore

Monitore é uma aplicação web voltada para acompanhamento e monitoramento de informações de forma centralizada, oferecendo maior visibilidade e controle sobre eventos ou registros relevantes.
O projeto é estruturado com foco em simplicidade, escalabilidade e fácil integração com banco de dados.

🧱 Tecnologias Utilizadas

Frontend: React (Vite)

Linguagem: TypeScript / JavaScript

Estilização: Tailwind CSS

Backend / Banco: Supabase (PostgreSQL gerenciado)

Empacotamento: Vite

Outros: APIs e serviços específicos conforme necessidade

🚀 Como Rodar o Projeto Localmente
1️⃣ Clonar o Repositório

git clone https://github.com/vitorhsanches/Monitore.git


cd Monitore

2️⃣ Instalar Dependências

npm install

3️⃣ Configurar Variáveis de Ambiente

Crie um arquivo .env na raiz do projeto seguindo o arquivo .env.example com, por exemplo:

VITE_SUPABASE_URL=coloque-sua-url-aqui
VITE_SUPABASE_ANON_KEY=coloque-sua-anon-key-aqui

4️⃣ Rodar em Modo Desenvolvimento

npm run dev

O Vite abrirá o projeto em uma porta como:

http://localhost:5173

📁 Estrutura Geral do Projeto

/

src/

components/

pages/

hooks/

services/

main.tsx

public/

supabase/

migrations/

...

.env.example

package.json

README.md

...

🛠️ Scripts Disponíveis

npm run dev – inicia o servidor de desenvolvimento

npm run build – gera o build de produção

npm run preview – pré-visualiza o build gerado

🗄️ Banco de Dados – Supabase

O projeto utiliza o Supabase como backend, oferecendo:

Banco de dados PostgreSQL gerenciado

API automática (REST e GraphQL)

Autenticação

Armazenamento de arquivos

Sistema de migrations para versionamento do banco

Essa abordagem garante simplicidade, escalabilidade e integração direta com o frontend via SDK.

🔧 Configuração do Banco de Dados

Para rodar o projeto com seu próprio banco:

Crie um projeto no Supabase: https://supabase.com

Acesse Project Settings → API

Copie sua URL do projeto e sua Anon Key

Preencha o arquivo .env com suas credenciais, por exemplo:

VITE_SUPABASE_URL=coloque-sua-url-aqui
VITE_SUPABASE_ANON_KEY=coloque-sua-anon-key-aqui

🧱 Migrations do Banco

As migrations ficam na pasta:

supabase/migrations/

Para aplicar migrations localmente:

supabase db push

🔌 Conexão com o Frontend

A aplicação utiliza o Supabase JS Client. Exemplo genérico de inicialização:

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
 import.meta.env.VITE_SUPABASE_URL,
 import.meta.env.VITE_SUPABASE_ANON_KEY
)

Operações suportadas

Insert, Select, Update, Delete

Autenticação (opcional)

Upload de arquivos (storage)

Realtime (se habilitado)

