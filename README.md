# Correria

App pessoal offline-first (Ionic 8 + Angular + Capacitor 6) que unifica agenda, tarefas, financeiro e notas. Tema escuro com laranja; marca **Correria**.

## Rodar no browser

```bash
npm install
npm start
```

Abra `http://localhost:4200`. No web o SQLite roda via `jeep-sqlite` (`sql-wasm.wasm` em `assets/`), com fallback para store em memória se o WASM falhar.

## Build e Android

```bash
npm run build
npx cap sync android
npx cap open android
```

`android/app/google-services.json` já está no projeto (Firebase `correria-app`).

## Notificações

- **Locais** (`@capacitor/local-notifications`): lembretes/eventos/vencimentos — funcionam no Android; no web usam `Notification` da API do browser quando permitido.
- **Push (FCM, plano Spark/free)**: projeto Firebase `correria-app` + apps Android/Web criados.
  - Android: plugin `@capacitor/push-notifications` + `google-services.json`.
  - Web: precisa da **VAPID key** em `environment.firebase.vapidKey` (Console Firebase → Project settings → Cloud Messaging → Web Push certificates).

## Configuração ainda pendente

1. **VAPID key** (push web) — gerar no Console e colar em `src/environments/environment*.ts`.
2. **SHA-1/SHA-256 do keystore Android** — adicionar no app Firebase Android (útil para builds de release e alguns serviços Google).
3. **Criptografia SQLite** — opcional: `encryption: true` + `dbEncryptionKey` (não commitar a chave).
4. **Ícones/splash nativos finais** — launcher já usa o emblema “C”; splash default Capacitor ainda pode ser trocado.
5. **Envio de push** — pelo Console Firebase (Cloud Messaging) ou Cloud Functions (Spark tem limites; envio manual pelo console é free).

## Arquitetura

Ver `arquitetura.md`. Escopo do MVP em `prompt.md`.
