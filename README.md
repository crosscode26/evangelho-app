# O Evangelho Segundo o Espiritismo — App

Aplicativo mobile (React Native + Expo, TypeScript) para leitura e escuta diária de
passagens de "O Evangelho Segundo o Espiritismo", com sorteio aleatório, player de
áudio via TTS, notificação diária agendada e histórico de leituras.

## Como rodar

```bash
npm install
npx expo start
```

Abra no dispositivo com o app **Expo Go** (escaneie o QR code) ou rode em um
emulador Android/iOS a partir do menu do Metro Bundler.

Requisitos: Node.js 18+, npm, e o Expo Go instalado no celular (ou Xcode/Android
Studio para emuladores).

## Estrutura do projeto

```
App.tsx                     Ponto de entrada: providers, fontes, splash screen
src/
  data/chapters.json        Base de dados (seed) do livro, offline
  types/                    Tipos TypeScript compartilhados
  theme/                    Paleta de cores e tipografia (claro/escuro)
  context/
    AppDataContext.tsx      Estado global: configurações, histórico, favoritos, sorteio
    ThemeContext.tsx        Resolve tema claro/escuro/sistema
  utils/
    random.ts                Lógica de sorteio (sem repetição consecutiva)
    storage.ts                Persistência local via AsyncStorage
    notifications.ts          Agendamento de notificação diária local
  components/
    PrimaryButton.tsx        Botão de CTA com microinteração e haptics
    AudioPlayer.tsx          Player TTS: play/pause/stop, velocidade, progresso
    PassageCard.tsx          Card usado na lista de histórico
  screens/
    HomeScreen.tsx            Tela inicial com "Sortear Mensagem"
    ReadingScreen.tsx         Leitura + player + favoritar/compartilhar
    HistoryScreen.tsx         Histórico de sorteios com filtro de favoritos
    SettingsScreen.tsx        Horário do lembrete, tema, tamanho de fonte
  navigation/
    RootNavigator.tsx         Stack raiz + roteamento por notificação
    BottomTabs.tsx             Tabs: Início, Histórico, Ajustes
```

## Decisões de design

- **Paleta**: bege quente (`#FAF6F0`) no modo claro e cinza-chumbo (`#1C1C1E`) no
  modo escuro, com dourado suave (`#C9A24B` / `#D8B564`) como cor de destaque —
  remete a um clima contemplativo, sem parecer um app corporativo genérico.
- **Tipografia**: Lora (serifada) para títulos e corpo de leitura — melhora o
  conforto em textos longos — e Inter (sans-serif) para elementos de interface
  (botões, rótulos, navegação).
- **Áudio (`expo-speech`)**: o pause/resume nativo só é confiável no iOS; no
  Android, o botão de pausa se comporta como parar, por limitação da própria API
  nativa (documentado no código-fonte do `AudioPlayer.tsx`). A barra de progresso
  é uma estimativa baseada em contagem de palavras e velocidade, já que o
  `expo-speech` não expõe posição real de reprodução em todas as plataformas.
- **Notificações**: usa `expo-notifications` com canal dedicado no Android e
  pedido de permissão explícito. Ao tocar na notificação, o app sorteia uma nova
  passagem e abre diretamente na tela de leitura.
- **Persistência**: `AsyncStorage` guarda configurações, histórico (até 200
  entradas) e favoritos — tudo funciona 100% offline.

## Dados

O arquivo `src/data/chapters.json` contém 5 capítulos com 11 itens no total,
com texto original escrito com base nos temas e títulos clássicos do livro de
Allan Kardec. Para produção, recomenda-se substituir/expandir pelo texto integral
de uma edição de domínio público ou licenciada, mantendo a mesma estrutura de
dados (`chapterNumber`, `chapterTitle`, `itemNumber`, `itemTitle`, `content`).

## Próximos passos sugeridos

- Substituir os ícones/splash de placeholder em `assets/` pela identidade visual
  final.
- Adicionar testes automatizados (Jest + Testing Library) para `utils/random.ts`
  e `context/AppDataContext.tsx`.
- Avaliar `expo-sqlite` caso o conteúdo cresça para o livro completo (mais de
  mil itens).
- Configurar EAS Build para gerar binários de distribuição (`eas build`).
