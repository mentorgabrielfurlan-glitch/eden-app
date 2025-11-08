# Checklist de testes manuais do app Eden

Esta checklist cobre o fluxo crítico de autenticação, recuperação de acesso e consumo de conteúdos (meditações e respirações). Cada seção apresenta pré-condições, passos recomendados, resultados esperados e sugestões de correção para falhas comuns. Utilize-a tanto em ambientes com Firebase configurado quanto em modo offline (armazenamento local via AsyncStorage).

> **Importante:** vários fluxos dependem de configuração correta do Firebase (variáveis `EXPO_PUBLIC_FIREBASE_*` ou `expo.extra.firebase*`). Caso elas estejam ausentes, o app usa um armazenamento local de contingência; valide ambos os modos sempre que possível.

## 1. Cadastro de novo usuário

### Cenário feliz (dados válidos)
1. Abrir o app e acessar **Criar conta** a partir da tela de login.
2. Preencher todos os campos obrigatórios: nome completo, e-mail válido, telefone, senha (mín. 6 caracteres), data e hora de nascimento e plano.
3. Tocar em **Cadastrar**.

**Resultado esperado**
- Exibição de Snackbar de sucesso: "Cadastro realizado com sucesso" ou mensagem indicando que os dados foram salvos em modo offline.【F:src/screens/SignupScreen.js†L135-L180】【F:src/services/authService.js†L39-L84】
- Navegação permanece na tela de cadastro com campos limpos.
- Novo usuário armazenado no Firebase (`users/{uid}`) ou persistido em AsyncStorage em modo offline.【F:src/services/authService.js†L49-L84】【F:src/services/localAuthStorage.js†L38-L89】

### Cenários de validação (dados inválidos)
Execute os testes abaixo individualmente, garantindo que somente o campo em foco esteja inválido:
- Campos vazios: deixar um campo obrigatório em branco e tocar em **Cadastrar**.
- E-mail com formato inválido (`usuario@dominio` sem TLD, caracteres inválidos etc.).
- Senha com menos de 6 caracteres.
- Ausência de data ou hora de nascimento.

**Resultado esperado**
- O botão mantém-se ativo mas a ação não prossegue; mensagens de erro em vermelho são exibidas sob cada campo inválido.【F:src/screens/SignupScreen.js†L90-L134】【F:src/screens/SignupScreen.js†L214-L286】

### Sugestões de correção
- Conferir se todas as variáveis de ambiente do Firebase estão presentes; caso contrário, seguir as orientações exibidas no topo da tela e providenciar as chaves antes de retestar.【F:src/screens/SignupScreen.js†L151-L200】【F:src/services/firebase.js†L74-L124】
- Em modo offline, uma tentativa de cadastro com e-mail já existente retorna erro `local/email-exists`; oriente o usuário a usar **Recuperar senha** ou outro e-mail.【F:src/services/localAuthStorage.js†L52-L89】
- Para mensagens `auth/email-already-in-use` ou `auth/operation-not-allowed`, verificar a configuração do Firebase Authentication e habilitar o provedor Email/Password.【F:src/services/authService.js†L56-L82】

## 2. Login com credenciais corretas/incorretas

### Credenciais corretas
1. Na tela de login, inserir e-mail e senha válidos para um usuário existente.
2. Tocar em **Login**.

**Resultado esperado**
- Feedback visual de carregamento no botão.
- Redirecionamento para a tela **Home** após autenticação bem-sucedida.【F:src/screens/LoginScreen.js†L26-L59】

### Credenciais incorretas
Testar individualmente:
- E-mail não cadastrado.
- Senha incorreta.
- E-mail com formato inválido.

**Resultado esperado**
- Permanência na tela de login.
- Mensagens amigáveis em português informando o motivo da falha (`Não encontramos uma conta com esse e-mail`, `A senha informada está incorreta`, etc.).【F:src/screens/LoginScreen.js†L14-L25】【F:src/services/authService.js†L86-L124】

### Sugestões de correção
- Conferir conectividade ou configuração do Firebase se mensagens genéricas forem exibidas; em modo offline, validar se o usuário foi previamente criado no dispositivo.【F:src/services/authService.js†L86-L124】【F:src/services/localAuthStorage.js†L91-L126】
- Para `Muitas tentativas de login`, aguardar alguns minutos ou redefinir senha.

## 3. Recuperação de senha

### E-mail cadastrado
1. A partir da tela de login, tocar em **Esqueci minha senha**.
2. Inserir o e-mail do usuário e tocar em **Enviar e-mail**.

**Resultado esperado**
- Mensagem de sucesso indicando envio do link (Firebase) ou senha temporária gerada (modo offline).【F:src/screens/ForgotPasswordScreen.js†L26-L61】【F:src/services/authService.js†L126-L159】【F:src/services/localAuthStorage.js†L160-L190】

### E-mail não cadastrado ou inválido
- Repetir o fluxo com e-mail inexistente ou formato inválido.

**Resultado esperado**
- Mensagem de erro informando que a conta não foi encontrada ou que o e-mail é inválido.【F:src/screens/ForgotPasswordScreen.js†L14-L25】

### Sugestões de correção
- Validar se a caixa de entrada recebeu o e-mail; caso não, conferir configurações do provedor Firebase e domínios autorizados.
- Em modo offline, orientar o usuário a copiar a senha temporária exibida para efetuar login e, em seguida, atualizar a senha manualmente via fluxo de cadastro (não há mudança automática na interface).

## 4. Visualização e edição de perfil

### Carregamento de dados
1. Autenticar-se e navegar até **Meu Perfil**.
2. Verificar se telefone, hora de nascimento e plano são carregados (vazios para novos usuários).

**Resultado esperado**
- Indicador de carregamento até que os dados sejam exibidos.
- Ausência de mensagens de erro se o usuário estiver autenticado.【F:src/screens/ProfileScreen.js†L16-L68】

### Edição e salvamento
1. Alterar os campos disponíveis e tocar em **Salvar**.

**Resultado esperado**
- Exibição de mensagem "Perfil atualizado com sucesso!" e persistência dos dados (Firebase ou AsyncStorage).【F:src/screens/ProfileScreen.js†L69-L112】【F:src/services/authService.js†L161-L201】

### Sugestões de correção
- Caso surja "Nenhum usuário autenticado", validar sessão (login pode ter expirado ou, no modo offline, não há usuário ativo).【F:src/screens/ProfileScreen.js†L26-L45】【F:src/services/localAuthStorage.js†L126-L159】
- Para falhas de rede, confirmar conectividade ou revisar regras do Firestore.

## 5. Listagem e reprodução de meditações

### Listagem
1. Na tela **Home**, tocar em **Explorar meditações**.
2. Confirmar carregamento da lista ordenada por título.

**Resultado esperado**
- Indicador de progresso enquanto os dados são buscados.
- Lista preenchida ou mensagem "Nenhuma meditação encontrada" em caso de coleção vazia.【F:src/screens/MeditationsListScreen.js†L10-L104】
- Se o Firebase não estiver configurado, exibir erro "Configuração do Firebase ausente".【F:src/screens/MeditationsListScreen.js†L22-L48】

### Reprodução
1. Selecionar uma meditação e tocar em **Tocar**.

**Resultado esperado**
- A tela do player exibe título, descrição, duração e barra de progresso.
- O áudio inicia automaticamente; botões de play/pause e favoritos respondem ao toque.【F:src/screens/MeditationPlayerScreen.js†L19-L210】
- Conclusão da faixa registra progresso no Firestore quando autenticado.【F:src/screens/MeditationPlayerScreen.js†L39-L118】

### Sugestões de correção
- Para mensagens de erro ao carregar áudio, validar URL `audioUrl` e acessibilidade do arquivo.
- Quando o player não inicia, conferir permissões de áudio do dispositivo e configuração `Audio.setAudioModeAsync`.
- Em ausência de Firebase, confirme se o fallback desejado (exibir erro amigável) aparece e registre um bug se o app travar sem feedback.

## 6. Listagem e reprodução de respirações

**Status atual:** Não há telas nem serviços dedicados a respirações na base de código (`rg "breath"` não retorna resultados em `src/`). Documentar este gap como bug conhecido e alinhar com o time de produto.

### Recomendações
- Definir requisitos funcionais (fontes de dados, interface) antes de criar casos de teste executáveis.
- Enquanto a funcionalidade não existir, marcar o cenário como **não aplicável** na planilha de testes e registrar demanda de desenvolvimento.

## 7. Regras de segurança – isolamento de dados

### Teste recomendado (Firebase)
1. Utilizando o emulador do Firestore ou o console, autenticar-se como usuário A.
2. Tentar ler/escrever documentos de outro usuário (por exemplo, `/users/{uidB}` ou `/userProgress/{uidB}`).

**Resultado esperado**
- A regra deve negar acesso com erro `permission-denied`. Caso contrário, ajustar regras do Firestore para validar `request.auth.uid == resource.id` (para `/users`) e `request.auth.uid == resource.id` nos registros de progresso.【F:src/services/authService.js†L39-L118】

### Teste recomendado (modo offline)
1. Criar dois usuários no mesmo dispositivo.
2. Confirmar, via AsyncStorage (usando `expo-secure-store` ou ferramentas de inspeção), que cada usuário mantém dados independentes.

**Resultado esperado**
- O app só deve carregar o perfil associado ao usuário logado; tentar alterar diretamente o armazenamento do outro usuário deve falhar por não haver sessão ativa.【F:src/services/localAuthStorage.js†L91-L159】

### Sugestões de correção
- Ajustar regras do Firestore para garantir isolamento (`match /users/{uid} { allow read, write: if request.auth.uid == uid; }`).
- No modo offline, garantir que `SESSION_KEY` troque corretamente ao alternar de usuário (utilizar botão de logout quando for implementado).

## Registro de execução

| Cenário | Responsável | Data | Resultado |
| --- | --- | --- | --- |
| Cadastro | | | |
| Login | | | |
| Recuperação de senha | | | |
| Perfil | | | |
| Meditações | | | |
| Respirações | | | Não aplicável |
| Segurança | | | |

Preencher a tabela ao finalizar cada rodada de validação.

## Observações finais
- Sempre que possível, executar os testes tanto em Android quanto em iOS/Web para validar diferenças de componentes nativos (ex.: seletor de data/hora).【F:src/screens/SignupScreen.js†L200-L286】
- Antes de iniciar os testes, limpar dados locais (`AsyncStorage`) para evitar falsos positivos, especialmente ao validar fluxos offline.【F:src/services/localAuthStorage.js†L5-L176】

