# 🚀 Deploy no Render - App de Apostas

## ✅ Passos para Deploy

### 1. Configure o Banco Supabase
Execute a SQL fornecida (`supabase-schema.sql`) no SQL Editor do Supabase

### 2. Configure Variáveis no Render
No painel do Render, adicione estas variáveis de ambiente:

- `DATABASE_URL` - URL completa do PostgreSQL do Supabase
- `SUPABASE_URL` - URL do projeto Supabase  
- `SUPABASE_ANON_KEY` - Chave anônima do Supabase
- `NODE_ENV` - production

### 3. Configurações do Deploy
- **Build Command:** `npm install`
- **Start Command:** `npm run dev`
- **Environment:** Node.js
- **Port:** 5000 (configurado automaticamente)

## 📝 Observações
- ✅ Projeto testado e funcionando
- ✅ Banco conecta automaticamente com Supabase
- ✅ Frontend e backend no mesmo processo
- ✅ Todas dependências incluídas

## 🐛 Troubleshooting
Se houver problemas:
1. Verifique se todas as variáveis estão configuradas
2. Confirme que a SQL foi executada no Supabase
3. Teste a conexão do banco no Render