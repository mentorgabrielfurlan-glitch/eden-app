# Eden App

Scaffold completo de um app Expo + Firebase com navegação, players de áudio e telas principais para onboarding, conteúdos e gestão de sessões.

## Configuração inicial

1. Clone o repositório e instale dependências:
   ```bash
   git clone <repo>
   cd eden-app
   npm install
   ```
2. Configure as variáveis de ambiente do Firebase (SDK v9 modular). Para desenvolvimento local use `app.config.ts`/`app.json` ou variáveis `EXPO_PUBLIC_*`:
   ```bash
   export EXPO_PUBLIC_FIREBASE_API_KEY="sua_api"
   export EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN="seu-projeto.firebaseapp.com"
   export EXPO_PUBLIC_FIREBASE_PROJECT_ID="seu-projeto"
   export EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET="seu-projeto.appspot.com"
   export EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="000000000000"
   export EXPO_PUBLIC_FIREBASE_APP_ID="1:000000000000:web:abcdef"
   ```
3. Opcional: ajuste `src/services/firebase.ts` para ler essas variáveis em runtime (via `expo-constants`).
4. Execute a seed opcional do Firestore:
   ```bash
   firebase firestore:import --project <projeto> docs/firestore-seed.json
   ```

## Comandos principais

| Comando | Descrição |
| --- | --- |
| `npm install` | Instala dependências do app Expo. |
| `npm start` | Inicia o bundler do Expo (`expo start`). |
| `npm run android` / `npm run ios` / `npm run web` | Abre o app no emulador correspondente. |
| `npm run lint` | Executa o linting padrão do Expo. |
| `cd server && npm install && npm run dev` | Sobe o micro-servidor Express de progresso (`POST /progress/complete`). |

## Fluxo sugerido de desenvolvimento

Os arquivos foram gerados seguindo a sequência de prompts abaixo. Reaplique essa ordem ao iterar:

1. Scaffold base (`App.tsx`, `src/AppRoot.tsx`, navegação, serviços Firebase).
2. Provedores e hooks (`useAuth`, `useAudio`, `useFetch`, `useForm`).
3. Telas de autenticação (Welcome, Signup, Login, ForgotPassword).
4. Navegação principal + Home, Listas, Player e componentes reutilizáveis (`ContentCard`, `AudioPlayer`, `GardenMini`, `SOS*`).
5. Telas de perfil, pagamentos, sessões e admin upload.
6. Serviços auxiliares (`src/services/*.ts`) e tipos (`src/types/models.ts`).
7. Backend auxiliar (`server/index.ts`), regras do Firestore e dados seed em `docs/`.

## Checklist de testes manuais

- Cadastro completo (Signup → criação de doc em `users`).
- Login e recuperação de senha.
- Player rápido: Quick Play abre modal e reproduz áudio.
- Lista de meditações com filtros por nível/tag.
- Upload administrativo: validar restrição `role === 'admin'` e criação de docs.
- Fluxo de agendamento de sessão e histórico.
- Verificação das regras do Firestore usando o emulador (usuário não consegue editar doc de outro usuário, admin consegue gravar em `meditations/breathings/therapists`).
- Player com rede limitada (simular 3G) para avaliar buffering.

## Boas práticas e LGPD

- Armazene segredos (chaves Firebase, Stripe) em variáveis seguras (`Secrets` do Expo ou serviços de configuração remota). Nunca versione `.env` com dados sensíveis.
- Ao manipular dados pessoais (nome, email, telefone, preferências), informe a base legal, permita exclusão e audite acessos.
- Revise periodicamente regras de segurança (`firestore.rules`) e os Cloud Functions responsáveis por envios de e-mail/notificações.
- Caso colete métricas, anonimize ou agregue as informações antes de persistir/compartilhar.

## Testes automatizados e QA

Consulte `docs/qa-checklist.md` para um roteiro detalhado de testes unitários, fluxos E2E e validações em Firestore/Player.
