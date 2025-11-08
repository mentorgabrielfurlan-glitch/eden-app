# Importação dos dados de seed

1. Instale a CLI do Firebase e faça login:
   ```bash
   npm install -g firebase-tools
   firebase login
   ```
2. Execute a importação usando o emulador ou diretamente no projeto:
   ```bash
   firebase firestore:import --project <seu-projeto> docs/firestore-seed.json
   ```
   > Também é possível importar manualmente via Console em *Firestore -> Import/Export* selecionando o JSON.
3. Após importar, valide as regras tentando ler/gravar documentos com `firebase emulators:exec` ou via scripts.
