import 'package:tray_manager/tray_manager.dart';
import 'package:window_manager/window_manager.dart';
import 'settings_service.dart';

class AppTray with TrayListener {
  static final AppTray _instance = AppTray._internal();
  factory AppTray() => _instance;
  AppTray._internal();

  final _settings = SettingsService();

  Future<void> init() async {
    trayManager.addListener(this);
    await trayManager.setIcon('assets/tray_icon.ico');
    await trayManager.setToolTip('To-Do Timer');
    await _settings.checkStartupEnabled();
    await _buildMenu();
  }

  Future<void> _buildMenu() async {
    final soundOn = _settings.soundEnabled;
    final startupOn = _settings.startupEnabled;

    await trayManager.setContextMenu(Menu(items: [
      MenuItem(key: 'show', label: 'Abrir'),
      MenuItem.separator(),
      MenuItem(
        key: 'sound',
        label: soundOn ? '🔔  Som ativado' : '🔕  Som desativado',
      ),
      MenuItem(
        key: 'startup',
        label: startupOn ? '✅  Iniciar com Windows' : '⬜  Iniciar com Windows',
      ),
      MenuItem.separator(),
      MenuItem(key: 'quit', label: 'Sair'),
    ]));
  }

  @override
  void onTrayIconMouseDown() => _showWindow();

  @override
  void onTrayMenuItemClick(MenuItem menuItem) async {
    switch (menuItem.key) {
      case 'show':
        _showWindow();
      case 'sound':
        await _settings.setSoundEnabled(!_settings.soundEnabled);
        await _buildMenu();
      case 'startup':
        await _settings.setStartupEnabled(!_settings.startupEnabled);
        await _buildMenu();
      case 'quit':
        _quit();
    }
  }

  Future<void> _showWindow() async {
    await windowManager.show();
    await windowManager.focus();
  }

  void _quit() {
    trayManager.removeListener(this);
    windowManager.destroy();
  }

  void dispose() {
    trayManager.removeListener(this);
  }
}
