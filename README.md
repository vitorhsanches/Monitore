# Monitore

**Monitore** é uma aplicação web voltada para acompanhamento e monitoramento de informações de forma centralizada, oferecendo maior visibilidade e controle sobre eventos ou registros relevantes.  
O projeto é estruturado com foco em simplicidade, escalabilidade e fácil integração com banco de dados.

---

## 🧱 Tecnologias Utilizadas

- **Frontend:** React (Vite)
- **Linguagem:** TypeScript / JavaScript
- **Estilização:** Tailwind CSS
- **Backend / Banco:** Supabase (PostgreSQL gerenciado)
- **Empacotamento:** Vite
- **Outros:** APIs e serviços específicos conforme necessidade

---

## 🚀 Como Rodar o Projeto Localmente

### 1️⃣ Clonar o Repositório

```bash
git clone https://github.com/vitorhsanches/Monitore.git
cd Monitore

2️⃣ Instalar Dependências
npm install

3️⃣ Configurar Variáveis de Ambiente

Crie um arquivo .env na raiz do projeto seguindo o modelo do .env.example:

VITE_SUPABASE_URL=coloque-sua-url-aqui
VITE_SUPABASE_ANON_KEY=coloque-sua-anon-key-aqui


Você encontra essas informações no painel do Supabase em:
Project Settings → API

4️⃣ Rodar em Modo Desenvolvimento
npm run dev


O Vite abrirá o projeto em uma porta como:

http://localhost:5173

📁 Estrutura Geral do Projeto
/
├─ src/
│  ├─ components/
│  ├─ pages/
│  ├─ hooks/
│  ├─ services/
│  └─ main.tsx
├─ public/
├─ supabase/
│  ├─ migrations/
│  └─ ...
├─ .env.example
├─ package.json
├─ README.md
└─ ...

🛠️ Scripts Disponíveis

npm run dev – inicia o servidor de desenvolvimento

npm run build – gera o build de produção

npm run preview – pré-visualiza o build gerado
