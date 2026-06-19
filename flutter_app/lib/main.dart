import 'dart:io';
import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import 'package:local_notifier/local_notifier.dart';
import 'package:window_manager/window_manager.dart';
import 'settings_service.dart';
import 'tray.dart';
import 'webview_screen.dart';

Process? _nodeProcess;

Future<void> _startNodeServer(String appDir) async {
  final exeDir   = File(Platform.resolvedExecutable).parent.path;
  final node     = '$exeDir\\node.exe';
  final serverJs = '$appDir\\server.js';

  if (!File(node).existsSync() || !File(serverJs).existsSync()) return;

  _nodeProcess = await Process.start(
    node,
    [serverJs],
    workingDirectory: appDir,
    environment: {'NODE_ENV': 'production'},
  );

  // Aguarda o servidor escrever "ready" no stdout (timeout 30s)
  final ready = Completer<void>();
  _nodeProcess!.stdout
      .transform(const SystemEncoding().decoder)
      .listen((line) {
    if (!ready.isCompleted && line.contains('ready')) ready.complete();
  });

  await ready.future.timeout(
    const Duration(seconds: 30),
    onTimeout: () {},
  );
}

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  final exeDir  = File(Platform.resolvedExecutable).parent.path;
  final webApp  = '$exeDir\\webapp';
  await _startNodeServer(webApp);

  WebViewEnvironment? webViewEnvironment;
  if (Platform.isWindows) {
    final localAppData = Platform.environment['LOCALAPPDATA'] ?? '';
    if (localAppData.isNotEmpty) {
      webViewEnvironment = await WebViewEnvironment.create(
        settings: WebViewEnvironmentSettings(
          userDataFolder: '$localAppData\\ToDoTimer\\WebView2Cache',
        ),
      );
    }
  }

  await localNotifier.setup(appName: 'To-Do Timer');
  await SettingsService().init();

  await windowManager.ensureInitialized();
  await windowManager.waitUntilReadyToShow(
    const WindowOptions(
      size: Size(1280, 800),
      minimumSize: Size(800, 600),
      center: true,
      title: 'To-Do Timer',
      backgroundColor: Color(0xFF0a0a0f),
      titleBarStyle: TitleBarStyle.normal,
    ),
    () async {
      await windowManager.show();
      await windowManager.focus();
    },
  );

  await AppTray().init();

  runApp(App(webViewEnvironment: webViewEnvironment));
}

class App extends StatefulWidget {
  const App({super.key, this.webViewEnvironment});
  final WebViewEnvironment? webViewEnvironment;

  @override
  State<App> createState() => _AppState();
}

class _AppState extends State<App> with WindowListener {
  @override
  void initState() {
    super.initState();
    windowManager.addListener(this);
    windowManager.setPreventClose(true);
  }

  @override
  void dispose() {
    windowManager.removeListener(this);
    AppTray().dispose();
    super.dispose();
  }

  @override
  void onWindowClose() async {
    if (SettingsService().minimizeOnClose) {
      await windowManager.hide();
    } else {
      AppTray().dispose();
      _nodeProcess?.kill();
      await windowManager.destroy();
    }
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      home: WebViewScreen(webViewEnvironment: widget.webViewEnvironment),
    );
  }
}
