import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import 'package:audioplayers/audioplayers.dart';
import 'package:local_notifier/local_notifier.dart';
import 'settings_service.dart';
import 'tray.dart';

const _appUrl = 'http://localhost:3000';

// Comando enviado do handler JS (thread errada) para o State (platform thread)
sealed class _AudioCmd {}
class _PlayDefault extends _AudioCmd {}
class _PlayPreview extends _AudioCmd {
  final String file;
  final double volume;
  _PlayPreview(this.file, this.volume);
}

class WebViewScreen extends StatefulWidget {
  const WebViewScreen({super.key, this.webViewEnvironment});
  final WebViewEnvironment? webViewEnvironment;

  @override
  State<WebViewScreen> createState() => _WebViewScreenState();
}

class _WebViewScreenState extends State<WebViewScreen> {
  final _audio    = AudioPlayer();
  final _settings = SettingsService();
  final _cmds     = StreamController<_AudioCmd>.broadcast();
  StreamSubscription<_AudioCmd>? _sub;
  bool _loading   = true;

  @override
  void initState() {
    super.initState();
    // Listener roda na platform thread — aqui é seguro chamar audioplayers
    _sub = _cmds.stream.listen(_handleCmd);
  }

  Future<void> _handleCmd(_AudioCmd cmd) async {
    switch (cmd) {
      case _PlayDefault():
        if (!_settings.soundEnabled) return;
        try {
          await _audio.setVolume(_settings.soundVolume);
          await _audio.play(AssetSource('sounds/${_settings.soundFile}'));
        } catch (_) {}

      case _PlayPreview(file: final f, volume: final v):
        if (!_settings.soundEnabled) return;
        try {
          await _audio.setVolume(v.clamp(0.0, 1.0));
          await _audio.play(AssetSource('sounds/$f'));
        } catch (_) {}
    }
  }

  Future<void> _showNotification(String title, String body) async {
    final notification = LocalNotification(title: title, body: body);
    await notification.show();
  }

  void _registerHandlers(InAppWebViewController controller) {
    controller.addJavaScriptHandler(
      handlerName: 'pomodoroBreak',
      callback: (_) async {
        _cmds.add(_PlayDefault());
        await _showNotification('🍅 Hora da pausa!', 'Pomodoro concluído. Descanse um pouco.');
      },
    );

    controller.addJavaScriptHandler(
      handlerName: 'taskDone',
      callback: (args) async {
        final name = args.isNotEmpty ? args[0].toString() : 'Tarefa';
        _cmds.add(_PlayDefault());
        await _showNotification('✅ Concluído!', '"$name" foi finalizada.');
      },
    );

    controller.addJavaScriptHandler(
      handlerName: 'setSoundEnabled',
      callback: (args) async {
        final v = args.isNotEmpty && args[0] == true;
        await _settings.setSoundEnabled(v);
        await AppTray().rebuildMenu();
      },
    );

    controller.addJavaScriptHandler(
      handlerName: 'setVolume',
      callback: (args) async {
        if (args.isEmpty) return;
        final v = (args[0] as num).toInt();
        await _settings.setVolume(v);
      },
    );

    controller.addJavaScriptHandler(
      handlerName: 'setSoundFile',
      callback: (args) async {
        if (args.isEmpty) return;
        await _settings.setSoundFile(args[0].toString());
      },
    );

    controller.addJavaScriptHandler(
      handlerName: 'setMinimizeOnClose',
      callback: (args) async {
        final v = args.isNotEmpty && args[0] == true;
        await _settings.setMinimizeOnClose(v);
      },
    );

    controller.addJavaScriptHandler(
      handlerName: 'setStartOnBoot',
      callback: (args) async {
        final v = args.isNotEmpty && args[0] == true;
        await _settings.setStartupEnabled(v);
        await AppTray().rebuildMenu();
      },
    );

    controller.addJavaScriptHandler(
      handlerName: 'previewSound',
      callback: (args) {
        final file = args.isNotEmpty ? args[0].toString() : _settings.soundFile;
        final vol  = args.length > 1
            ? (args[1] as num).toDouble() / 100.0
            : _settings.soundVolume;
        // Apenas enfileira — o listener no State executa na platform thread
        _cmds.add(_PlayPreview(file, vol));
      },
    );
  }

  @override
  void dispose() {
    _sub?.cancel();
    _cmds.close();
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
