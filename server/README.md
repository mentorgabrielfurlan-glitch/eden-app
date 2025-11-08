# Eden Progress API

Pequeno servidor Express em TypeScript com o endpoint `POST /progress/complete`.

## Como executar

```bash
cd server
npm install
npm run dev # ou npm run build && npm start
```

## Testar com curl

```bash
curl -X POST http://localhost:3333/progress/complete \
  -H "Authorization: Bearer demo-token" \
  -H "Content-Type: application/json" \
  -d '{"user_id":"123","content_type":"meditation","content_id":"abc"}'
```

Substitua o cabeçalho Authorization por um JWT válido quando o middleware for implementado de verdade.
