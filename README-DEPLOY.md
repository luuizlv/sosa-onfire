# 🎯 SISTEMA DE APOSTAS CORRIGIDO - DEPLOY RENDER

## ✅ PROBLEMAS RESOLVIDOS

### 1. ❌ Apostas vinham como "GANHA" automaticamente
✅ **CORRIGIDO**: Agora vêm como "PENDENTE" por padrão

### 2. ❌ Lucro contava apostas pendentes
✅ **CORRIGIDO**: Lucro conta apenas:
- ➕ Apostas GANHAS: soma (payout - stake)
- ➖ Apostas PERDIDAS: subtrai stake
- ⏳ Apostas PENDENTES: não conta no lucro

### 3. ❌ Lucro estático (não atualizava)
✅ **CORRIGIDO**: Lucro atualiza automaticamente quando muda status

## 🚀 DEPLOY NO RENDER

### 1. CONFIGURE DATABASE_URL CORRETA
No painel do Render, configure EXATAMENTE:

```
DATABASE_URL=postgresql://postgres.SEU_REF:SUA_SENHA@aws-0-us-east-1.pooler.supabase.com:6543/postgres
SUPABASE_URL=https://SEU_REF.supabase.co
SUPABASE_ANON_KEY=SUA_CHAVE_AQUI
NODE_ENV=production
```

### 2. EXECUTE SQL NO SUPABASE
Use o arquivo `supabase-schema-fix.sql` no SQL Editor

### 3. CONFIGURAÇÕES DEPLOY
- **Build Command:** `npm install`
- **Start Command:** `npm run dev`

## 📊 COMO FUNCIONA AGORA

### Status das Apostas:
- **PENDENTE** 🟡: Não conta no lucro
- **GANHA** 🟢: Soma no lucro (payout - stake)
- **PERDIDA** 🔴: Subtrai do lucro (stake)

### Cálculos:
- **Total Apostado**: TODAS as apostas
- **Total Recebido**: Apenas apostas GANHAS
- **Lucro**: Ganhas - Perdidas (pendentes = 0)

## ✅ VERIFICAÇÃO
Após deploy, teste:
1. Criar aposta → deve vir PENDENTE
2. Marcar como GANHA → lucro aumenta
3. Marcar como PERDIDA → lucro diminui
4. Voltar para PENDENTE → lucro ajusta