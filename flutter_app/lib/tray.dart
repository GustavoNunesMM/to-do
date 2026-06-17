import 'package:tray_manager/tray_manager.dart';
import 'package:window_manager/window_manager.dart';
import 'settings_service.dart';
import 'widget_window.dart';

class AppTray with TrayListener {
  static final AppTray _instance = AppTray._internal();
  factory AppTray() => _instance;
  AppTray._internal();

  final _settings = SettingsService();

  Future<void> init() async {
    trayManager.addListener(this);
    await trayManager.setIcon('assets/icon.ico');
    await trayManager.setToolTip('To-Do Timer');
    await _settings.checkStartupEnabled();
    await _buildMenu();
  }

  Future<void> rebuildMenu() => _buildMenu();

  Future<void> _buildMenu() async {
    final soundOn = _settings.soundEnabled;
    final startupOn = _settings.startupEnabled;

    final widgetOn = WidgetWindowManager.isOpen;

    await trayManager.setContextMenu(Menu(items: [
      MenuItem(key: 'show', label: 'Abrir'),
      MenuItem(
        key: 'widget',
        label: widgetOn ? '▣  Widget ativado' : '▢  Widget desativado',
      ),
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
      case 'widget':
        if (WidgetWindowManager.isOpen) {
          await WidgetWindowManager.close();
        } else {
          await WidgetWindowManager.open();
        }
        await _buildMenu();
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
