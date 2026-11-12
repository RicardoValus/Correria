# Pulso

App pessoal offline-first (Ionic 8 + Angular + Capacitor 6) que unifica agenda, tarefas, financeiro e notas. Tema escuro com laranja como destaque.

## Rodar no browser

```bash
npm install
npm start
```

Abra `http://localhost:4200`. No web a persistência usa store em memória com `localStorage` (fallback do SQLite nativo).

## Build e Android

```bash
npm run build
npx cap add android   # só na primeira vez
npx cap sync android
npx cap open android
```

Requisitos nativos: Android Studio, JDK 17+, SDK Android.

## Testes

```bash
npm test
```

Os testes de domínio (ex.: previsão de saldo) ficam em `src/app/features/financeiro/domain/`.

## Arquitetura

Ver `arquitetura.md`. Escopo do MVP (Fase 1) em `prompt.md`.

## Configuração pendente

Itens que você precisa configurar antes de produção/device:

1. **Android** — `npx cap add android` + ícones/splash (`resources/`) + assinar o APK/AAB.
2. **Criptografia SQLite** — em `environment.prod.ts`, defina `encryption: true` e `dbEncryptionKey` via mecanismo seguro (não commitar a chave).
3. **Notificações locais** — só funcionam em device/emulador; conceda permissão na primeira execução.
4. **Firebase / sync** — Fase 3; não há projeto Firebase nesta versão.
5. **Biometria / PIN** — Fase 3.
6. **Ícone de notificação Android** — ajustar `smallIcon` em `capacitor.config.ts`.
