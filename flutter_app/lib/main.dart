import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import 'package:local_notifier/local_notifier.dart';
import 'package:window_manager/window_manager.dart';
import 'settings_service.dart';
import 'tray.dart';
import 'webview_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

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
