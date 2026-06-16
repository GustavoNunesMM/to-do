import 'package:flutter/material.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import 'package:just_audio/just_audio.dart';
import 'package:local_notifier/local_notifier.dart';
import 'settings_service.dart';

const _appUrl = 'http://localhost:3000';

class WebViewScreen extends StatefulWidget {
  const WebViewScreen({super.key, this.webViewEnvironment});
  final WebViewEnvironment? webViewEnvironment;

  @override
  State<WebViewScreen> createState() => _WebViewScreenState();
}

class _WebViewScreenState extends State<WebViewScreen> {
  final _audio = AudioPlayer();
  final _settings = SettingsService();
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _initAudio();
  }

  Future<void> _initAudio() async {
    await _audio.setAsset('assets/sounds/notify.wav').catchError((_) => const Duration());
  }

  Future<void> _playSound() async {
    if (!_settings.soundEnabled) return;
    try {
      await _audio.seek(Duration.zero);
      await _audio.play();
    } catch (_) {}
  }

  Future<void> _showNotification(String title, String body) async {
    final notification = LocalNotification(title: title, body: body);
    await notification.show();
  }

  void _registerHandlers(InAppWebViewController controller) {
    controller.addJavaScriptHandler(
      handlerName: 'pomodoroBreak',
      callback: (_) async {
        await _playSound();
        await _showNotification('🍅 Hora da pausa!', 'Pomodoro concluído. Descanse um pouco.');
      },
    );

    controller.addJavaScriptHandler(
      handlerName: 'taskDone',
      callback: (args) async {
        final name = args.isNotEmpty ? args[0].toString() : 'Tarefa';
        await _playSound();
        await _showNotification('✅ Concluído!', '"$name" foi finalizada.');
      },
    );
  }

  @override
  void dispose() {
    _audio.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          InAppWebView(
            initialUrlRequest: URLRequest(url: WebUri(_appUrl)),
            webViewEnvironment: widget.webViewEnvironment,
            initialSettings: InAppWebViewSettings(
              transparentBackground: true,
              supportZoom: false,
              disableContextMenu: true,
            ),
            onWebViewCreated: (controller) => _registerHandlers(controller),
            onLoadStop: (controller, _) async {
              // Desregistra SWs em cache que causam reloads dentro do WebView
              await controller.evaluateJavascript(source: '''
                if ('serviceWorker' in navigator) {
                  navigator.serviceWorker.getRegistrations()
                    .then(regs => regs.forEach(r => r.unregister()));
                }
              ''');
              if (mounted) setState(() => _loading = false);
            },
            onReceivedError: (_, __, ___) {
              if (mounted) setState(() => _loading = false);
            },
          ),

          if (_loading)
            const ColoredBox(
              color: Color(0xFF0a0a0f),
              child: Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    CircularProgressIndicator(color: Colors.white24, strokeWidth: 1.5),
                    SizedBox(height: 16),
                    Text(
                      'Iniciando...',
                      style: TextStyle(color: Colors.white24, fontSize: 13, letterSpacing: 1),
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}
