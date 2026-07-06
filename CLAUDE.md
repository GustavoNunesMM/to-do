# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## O que é este projeto

"To-Do Timer" é um app desktop Windows de tarefas com timer/pomodoro. É uma webapp Next.js rodando dentro de um shell nativo Flutter (via WebView), distribuída como instalador Inno Setup. Em produção o Next.js é exportado estaticamente (`output: 'export'` → `out/`) e servido por um mini servidor HTTP em Dart dentro do próprio exe (`flutter_app/lib/local_server.dart`) — não há Node.js embutido nem processo em segundo plano. Todo o UI e a lógica de negócio (tarefas, timer, calendário, grupos, configurações) vivem no Next.js; o Flutter é só a casca nativa (janela, tray, notificações, áudio, persistência de settings do SO).

## Comandos

```bash
pnpm dev              # Next.js em modo dev (webpack, porta padrão 3000)
pnpm build            # Build de produção do Next.js (export estático → out/, com PWA via next-pwa)
dev.bat               # Abre dois terminais (Windows Terminal): "Next.js Dev" + "Flutter Run" (flutter_app)
pnpm build:app        # Roda build.ps1 — build completo (ver abaixo)
```

Não há suíte de testes configurada (o `@playwright/test` está em devDependencies mas não há specs nem config no repo). Não há lint script definido no `package.json`.

Para desenvolver a parte Flutter (shell nativo), use o Flutter CLI direto dentro de `flutter_app/`:
```bash
flutter run --no-pub          # em debug (kDebugMode) o shell conecta ao Next.js em localhost:3000
flutter build windows --release
```

### Build de distribuição (`build.ps1`)

Orquestra o pipeline completo: build do Next.js (export estático) → build do Flutter Windows release → cópia de `out/` para `Release/webapp/` → geração do instalador via Inno Setup (`installer.iss`). Aceita flags para pular etapas: `-SkipNext`, `-SkipFlutter`, `-SkipInstaller`. Requer Inno Setup 6 instalado em `C:\Program Files (x86)\Inno Setup 6\ISCC.exe`.

O ícone da janela/exe vem de `flutter_app/windows/runner/resources/app_icon.ico` — deve ser mantido em sincronia com `flutter_app/assets/icon.ico` (usado pela bandeja e pelo instalador).

## Arquitetura

### As duas metades do app

1. **`app/`** — Next.js 16 (App Router) + React 19 + Tailwind v4 + MUI Joy. Toda a UI e o estado da aplicação. Em dev é servido pelo `pnpm dev` (browser ou WebView); em produção é exportado estaticamente e servido pelo servidor Dart embutido.
2. **`flutter_app/`** — shell Windows nativo (Flutter desktop). Não tem UI própria além de uma `WebViewScreen` que carrega a webapp. Responsabilidades: servir o export estático (`lib/local_server.dart`, porta efêmera do loopback; em debug usa `localhost:3000` do dev server), gerenciar janela (`window_manager`), ícone de bandeja (`tray_manager`), notificações nativas (`local_notifier`), reprodução de áudio (`audioplayers`) e persistência de settings do SO (`shared_preferences`, registro do Windows para "iniciar com o Windows").

A comunicação entre as duas metades é **unidirecional, Next.js → Flutter**, via `flutter_inappwebview`:
- `app/lib/flutter_bridge.ts` chama `window.flutter_inappwebview.callHandler(nome, ...args)`. É no-op fora da WebView (checagem de `window` e do objeto injetado), então funciona normalmente no browser em dev.
- `flutter_app/lib/webview_screen.dart` registra os handlers correspondentes (`pomodoroBreak`, `taskDone`, `setSoundEnabled`, `setVolume`, `setSoundFile`, `previewSound`, `setAmbientEnabled`, `setAmbientFile`, `setAmbientVolume`, `setMinimizeOnClose`, `setStartOnBoot`).
- Não há canal de volta (Flutter → Next.js). Configurações que o Flutter precisa conhecer (som, volume, ambient, minimizar ao fechar, iniciar com Windows) são espelhadas do `app/store/settings.tsx` para o `SettingsService` do Flutter (persistido via `shared_preferences`) toda vez que mudam.

Ao mexer em uma feature que envolve som, notificações, tray ou comportamento de janela, é preciso editar **os dois lados**: o dispatch em `flutter_bridge.ts`/`settings.tsx` e o handler correspondente em `webview_screen.dart`/`settings_service.dart`/`tray.dart`.

### Estado da aplicação (Next.js)

Não há backend/API — tudo é client-side, persistido em `localStorage` (chaves: `tasks-state`, `pomodoro-config`, `groups-state`, `completed-history`, `app-settings`). Providers em `app/layout.tsx`, aninhados: `SettingsProvider` → `WallpaperProvider` → `TasksProvider` → `TimerLiveProvider`.

- **`app/store/tasks.tsx`** — reducer com as tarefas (`Item[]`), grupos e histórico de conclusão. Tarefas podem ter subtarefas (`parentId`); deletar uma tarefa raiz cascade-deleta as subtarefas. Ordem dos itens raiz é reordenável (`REORDER`, drag-and-drop) — subtarefas não entram na reordenação.
- **`app/store/settings.tsx`** — settings do usuário (pomodoro, wallpaper, som, som ambiente, comportamento da janela). Cada `updateSettings` faz fan-out seletivo pra `flutter_bridge` conforme quais campos mudaram.
- **`app/store/timerContext.tsx`** — contexto simples só para o tempo restante "ao vivo" do timer (usado por quem precisa exibir o countdown sem re-renderizar a árvore toda).
- **`app/hooks/useTimer.ts`** — o coração do timer. Roda com `setInterval` de 1s e usa refs (não state) para os valores mutáveis a cada tick, evitando stale closures e re-criação do interval. Alterna entre modo `'task'` e `'pomodoro'`: quando o tempo decorrido da tarefa bate um múltiplo do intervalo pomodoro (por tarefa via `pomodoroIntervalMin`, ou global via `pomodoroConfig`), pausa a contagem da tarefa, roda um countdown de pausa (`pomodoroSec`), e retoma a tarefa automaticamente ao fim. Progresso é salvo (`updateProgress`) sempre que o timer é pausado ou entra em pomodoro, permitindo retomar depois de fechar o app. Controles: `stop()` só marca como aguardando (mantém progresso), `restart()` zera tudo, `finish()` conclui a tarefa. Tarefas com `continuous: true` (sem tempo definido) não têm progresso/remaining/conclusão automática — só contam `elapsedSec` pra cima (o pomodoro continua funcionando).
- **`app/lib/task.ts`** — funções puras de formatação de tempo/duração e `genId()` (gera IDs sem colisão combinando `Date.now()` com um sufixo aleatório — não usar `Date.now()` sozinho para IDs neste código).
- Tipos de domínio (`Item`, `Group`, `TaskStatus`, `PomodoroConfig`, `durationType`) são globais, declarados em `app/types/global.d.ts` (sem import necessário); tipos de props/UI ficam em `app/types/index.ts`.

### Componentes principais

- `app/components/clock/` — relógio circular com progresso (arco), controles de start/pause/stop.
- `app/components/calendar/` — visões diária/semanal/mensal com drag-and-drop de tarefas para agendar (`scheduledDate`/`scheduledTime`), lógica de drag isolada em `calendarDrag.tsx`.
- `app/components/group/` — agrupamento de tarefas por cor/categoria.
- `app/components/modal/createModal.tsx` — criação/edição de tarefas (e subtarefas).
- `app/components/settings/settingsModal.tsx` — abas de configuração (pomodoro, aparência, som, aplicativo) — é aqui que a maioria das chamadas à `flutter_bridge` se origina.
- `app/components/WallpaperProvider.tsx` — aplica o wallpaper (imagem/gradiente) salvo em settings ao `body`.

### Detalhes de infraestrutura

- `next.config.ts`: exporta uma função (não um objeto) porque precisa se comportar diferente por `phase` — só na fase de build de produção envolve com `next-pwa` (gera service worker) e ativa `output: 'export'` (gera `out/`); em dev, o service worker é explicitamente desregistrado por um script inline em `layout.tsx` (evita cache obsoleto durante desenvolvimento e dentro da WebView). Rotas de metadata (como `app/manifest.ts`) precisam de `export const dynamic = 'force-static'` por causa do export estático.
- Drag-and-drop: **usar pointer events, nunca a API HTML5 de drag-and-drop** (`draggable`/`onDragStart`) — ela não funciona dentro da WebView2 do shell Flutter. O padrão do projeto é `pointerdown` → listeners globais de `pointermove`/`pointerup` → destino via `elementsFromPoint`/bounding rects (ver `calendarDrag.tsx`, `latButtons.tsx`, `groupsPage.tsx`).
- Alias de import `@/*` aponta para a raiz do repo (configurado em `tsconfig.json`), então `app/...` é importado como `@/app/...`.
