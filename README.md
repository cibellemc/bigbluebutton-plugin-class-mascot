# Class Mascot Plugin

Plugin do BigBlueButton (SDK `1.0.0-beta.3`): a turma tem um mascote que evolui de 1 a 10 conforme a participação.

## Como funciona

- O moderador abre **Mascote da turma** na galeria de apps e escolhe o mascote (Mconfito Pixel, Caramelo ou Frajola). Todo mascote começa no nível 3.
- O mascote aparece numa janela flutuante para todos da sala, com o nível atual.
- O moderador confirma participações com **+1 ponto**, até o nível 10.
- Qualquer pessoa pode minimizar a janela do mascote só para si; a escolha fica salva no navegador.
- O botão de patinha à direita na barra superior esconde e mostra a janela do mascote, só para quem clicou. A janela abre logo abaixo do botão, como um menu.
- Mensagens de alunos no chat público e reações de alunos zeram a contagem de inatividade, sem dar pontos. Quem registra essa atividade é o cliente de um moderador presente na sala.
- Sem participação por um tempo configurável (padrão: 8 minutos), o mascote perde 1 ponto, até o nível 1.
- O estado é compartilhado pelo data channel `mascot-state`. O desconto por inatividade não depende de nenhuma aba aberta: cada participante calcula o nível atual a partir da última atividade, então o mascote continua perdendo pontos mesmo sem moderador na sala.

## Imagens

Uma imagem por nível em `public/assets/mascots/<mascote>/<nível>.png` (ex.: `public/assets/mascots/mconfito/1.png` até `10.png`). Enquanto a imagem não existir, o plugin mostra um emoji no lugar.

## Desenvolvimento

```bash
make install         # instala as dependências
make install-hooks   # uma vez depois de clonar: roda o lint antes de cada commit
make run             # serve manifest, bundle e relay em http://localhost:4701
make lint            # ESLint, type-check e Prettier
make test            # testes das regras de pontos (Jest)
make build           # gera dist/ClassMascot.js, dist/manifest.json e dist/assets/
```

`make help` lista todos os comandos.

### Demo local (sem BBB)

```bash
make demo            # abre em http://localhost:4702
```

Roda o plugin numa página que imita o BBB: menu lateral, galeria de apps, janela flutuante e data channel. O SDK é trocado por `demo/sdk-mock.ts` e o estado fica no `localStorage`, então abas do mesmo navegador funcionam como participantes da mesma sala. Use `?role=viewer` para entrar como aluno; o botão "Zerar estado" apaga o mascote.

### Numa sala do BBB

Para testar numa sala, exponha a porta 4701 em HTTPS (ex.: `cloudflared tunnel --url http://localhost:4701`) e passe na chamada `create`:

```
pluginManifests=[{"url":"https://<endereço>/manifest.json"}]
```

O manifest só é lido quando a sala é criada: depois de mudar o `manifest.json`, crie uma sala nova. Mudanças no código só pedem recarregar a página.

### Relay temporário

Alguns servidores não gravam o data channel do plugin, então o estado do mascote também passa por um relay no próprio servidor de desenvolvimento (`webpack.config.js` e `src/class-mascot/relay.ts`). Ele guarda o estado em memória, sem autenticação, e só funciona enquanto o `make run` e o túnel estiverem no ar. Quando o data channel funcionar, o plugin passa a usá-lo e o relay pode ser removido.
