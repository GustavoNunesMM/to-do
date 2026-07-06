import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import 'package:audioplayers/audioplayers.dart';
import 'package:local_notifier/local_notifier.dart';
import 'settings_service.dart';
import 'tray.dart';

sealed class _AudioCmd {}
class _PlayDefault  extends _AudioCmd {}
class _PlayPreview  extends _AudioCmd {
  final String file; final double volume;
  _PlayPreview(this.file, this.volume);
}
class _AmbientPlay  extends _AudioCmd {}
class _AmbientStop  extends _AudioCmd {}
class _AmbientVolume extends _AudioCmd {
  final double volume;
  _AmbientVolume(this.volume);
}

class WebViewScreen extends StatefulWidget {
  const WebViewScreen({super.key, required this.appUrl, this.webViewEnvironment});
  final String appUrl;
  final WebViewEnvironment? webViewEnvironment;

  @override
  State<WebViewScreen> createState() => _WebViewScreenState();
}

class _WebViewScreenState extends State<WebViewScreen> {
  final _audio    = AudioPlayer();
  final _ambient  = AudioPlayer();
  final _settings = SettingsService();
  final _cmds     = StreamController<_AudioCmd>.broadcast();
  StreamSubscription<_AudioCmd>? _sub;
  bool _loading   = true;
  InAppWebViewController? _webController;

  @override
  void initState() {
    super.initState();
    _sub = _cmds.stream.listen(_handleCmd);
    if (_settings.ambientEnabled) {
      _cmds.add(_AmbientPlay());
    }
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

      case _AmbientPlay():
        try {
          await _ambient.setReleaseMode(ReleaseMode.loop);
          await _ambient.setVolume(_settings.ambientVolume);
          await _ambient.play(AssetSource('sounds/ambient/${_settings.ambientFile}'));
        } catch (_) {}

      case _AmbientStop():
        try {
          await _ambient.stop();
        } catch (_) {}

      case _AmbientVolume(volume: final v):
        try {
          await _ambient.setVolume(v.clamp(0.0, 1.0));
        } catch (_) {}
    }
  }

  Future<void> _showNotification(String title, String body) async {
    final notification = LocalNotification(title: title, body: body);
    await notification.show();
  }

  void _registerHandlers(InAppWebViewController controller) {
    _webController = controller;

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
        await _settings.setVolume((args[0] as num).toInt());
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
      handlerName: 'previewSound',
      callback: (args) {
        final file = args.isNotEmpty ? args[0].toString() : _settings.soundFile;
        final vol  = args.length > 1
            ? (args[1] as num).toDouble() / 100.0
            : _settings.soundVolume;
        _cmds.add(_PlayPreview(file, vol));
      },
    );

    controller.addJavaScriptHandler(
      handlerName: 'setAmbientEnabled',
      callback: (args) async {
        final v = args.isNotEmpty && args[0] == true;
        await _settings.setAmbientEnabled(v);
        _cmds.add(v ? _AmbientPlay() : _AmbientStop());
      },
    );

    controller.addJavaScriptHandler(
      handlerName: 'setAmbientFile',
      callback: (args) async {
        if (args.isEmpty) return;
        await _settings.setAmbientFile(args[0].toString());
        if (_settings.ambientEnabled) _cmds.add(_AmbientPlay());
      },
    );

    controller.addJavaScriptHandler(
      handlerName: 'setAmbientVolume',
      callback: (args) async {
        if (args.isEmpty) return;
        final v = (args[0] as num).toInt();
        await _settings.setAmbientVolume(v);
        _cmds.add(_AmbientVolume(v / 100.0));
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
  }

  @override
  void dispose() {
    _sub?.cancel();
    _cmds.close();
    _audio.dispose();
    _ambient.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          InAppWebView(
            initialUrlRequest: URLRequest(url: WebUri(widget.appUrl)),
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
