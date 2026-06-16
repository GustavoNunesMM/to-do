import 'dart:io';
import 'package:shared_preferences/shared_preferences.dart';

const _keySound = 'sound_enabled';
const _keyStartup = 'startup_enabled';
const _appName = 'ToDoTimer';

String get _exePath => Platform.resolvedExecutable;

class SettingsService {
  static final SettingsService _instance = SettingsService._internal();
  factory SettingsService() => _instance;
  SettingsService._internal();

  late SharedPreferences _prefs;

  Future<void> init() async {
    _prefs = await SharedPreferences.getInstance();
  }

  // ── Som ────────────────────────────────────────────────────────────────────

  bool get soundEnabled => _prefs.getBool(_keySound) ?? true;

  Future<void> setSoundEnabled(bool value) async {
    await _prefs.setBool(_keySound, value);
  }

  // ── Iniciar com Windows ────────────────────────────────────────────────────

  bool get startupEnabled => _prefs.getBool(_keyStartup) ?? false;

  Future<bool> checkStartupEnabled() async {
    final result = await Process.run('reg', [
      'query',
      r'HKCU\Software\Microsoft\Windows\CurrentVersion\Run',
      '/v',
      _appName,
    ]);
    final enabled = result.exitCode == 0;
    await _prefs.setBool(_keyStartup, enabled);
    return enabled;
  }

  Future<void> setStartupEnabled(bool value) async {
    if (value) {
      await Process.run('reg', [
        'add',
        r'HKCU\Software\Microsoft\Windows\CurrentVersion\Run',
        '/v',
        _appName,
        '/t',
        'REG_SZ',
        '/d',
        '"$_exePath"',
        '/f',
      ]);
    } else {
      await Process.run('reg', [
        'delete',
        r'HKCU\Software\Microsoft\Windows\CurrentVersion\Run',
        '/v',
        _appName,
        '/f',
      ]);
    }
    await _prefs.setBool(_keyStartup, value);
  }
}
