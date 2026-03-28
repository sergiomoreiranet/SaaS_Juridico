# SaaS Legaltech - Piloto

Este repositório contém o MVP do SaaS Legaltech, desenvolvido de acordo com o **Master Roadmap v3**.

## Decisões Técnicas (Stack Foundation)

- **Next.js 14 (App Router)**: Escolhido como framework principal (Full-stack) por prover renderização otimizada (React Server Components), roteamento simplificado baseado em diretórios e facilidade no deploy via Vercel. Isso significa que podemos ter frontend e backend integrados numa única aplicação, perfeito para MVP rápido.
- **Tailwind CSS**: Framework de estilização utilitária para rápida confecção visual do dashboard jurídico sem precisarmos escrever CSS do zero. Ajuda a padronizar espaçamentos e cores do UI Kit.
- **Supabase**: Banco de dados relacional (PostgreSQL) robusto na nuvem que inclui Autenticação (NextAuth/Supabase Auth), Storage e Row Level Security (RLS). A escolha do PostgreSQL dá fundação sólida para escalar, enquanto o RLS garantirá a segurança no Multi-tenant ativo.
- **Drizzle ORM**: Facilita enormemente as queries ao banco de dados com segurança de tipo em TypeScript e gera migrações SQL precisas, não sendo tão focado e pesado como o Prisma nos tempos frios (cold starts).
- **Multi-tenant Architecture**: Uma tabela raiz `tenants` é a espinha dorsal de todo o banco de dados. Separar o dado lógico agora (por RLS + FK tenant_id) evitará um colapso quando vários escritórios de advocacia rodarem na nuvem ao mesmo tempo. 

## Como rodar o ambiente dev
1. Preencha seu `.env` com a Connection String do Supabase e Anon Key
2. Rode `npx drizzle-kit push` para migrar o banco
3. Rode `npm run dev` para iniciar o servidor Next.js na porta 3000
