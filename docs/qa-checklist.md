# Checklist de QA

## Testes unitários sugeridos

- `src/hooks/useForm.ts`: validar que erros são setados corretamente e `reset` limpa estado.
- `src/components/AudioPlayer.tsx`: isolar funções auxiliares (`formatTime`, persistência em AsyncStorage) e garantir que `skip` respeita limites.
- `src/services/contentService.ts`: mockar Firestore para garantir filtros por tag/nível.

Execute com Jest/Testing Library caso seja configurado:
```bash
npx jest src/hooks/useForm.test.ts
```

## Fluxos E2E críticos

1. **Signup → Login → Player → Marcar completo**
   - Criar conta com dados válidos.
   - Efetuar logout e login.
   - Abrir Home, Quick Play e reproduzir até o fim (verificar registro em `userProgress`).
2. **Sessões**
   - Agendar sessão em `SessionBookingScreen`.
   - Verificar histórico em `SessionHistoryScreen`.
3. **Upload admin**
   - Logar com usuário admin, subir nova meditação e confirmar doc/arquivo.

Ferramentas sugeridas: Detox para mobile ou Cypress com Expo Web.

## Testes manuais de segurança (Firestore)

Utilize o emulador local:
```bash
firebase emulators:start --only firestore
```

Em outro terminal, tente operações proibidas:
```bash
# Tentativa de ler perfil de outro usuário
firebase firestore:delete /users/OUTRO_UID --project demo-eden --token user-token --force
```

Valide que regras bloqueiam escrita em `meditations` para usuários sem `role == admin`.

## Performance do player (rede 3G)

1. No Expo DevTools selecione “Network Throttling → Slow 3G”.
2. Abra `AudioPlayer` e monitore o tempo de buffering.
3. Caso haja travamentos, considere pré-carregamento com `ensureOfflineAudio` em `audioService`.

## Comandos úteis

- Checar logs do backend Express:
  ```bash
  cd server && npm run dev
  ```
- Enviar progresso fake:
  ```bash
  curl -X POST http://localhost:3333/progress/complete \
    -H "Authorization: Bearer demo" \
    -H "Content-Type: application/json" \
    -d '{"user_id":"user_123","content_type":"meditation","content_id":"med_01"}'
  ```
