import 'dart:io';
import 'package:shared_preferences/shared_preferences.dart';

const _keySound = 'sound_enabled';
const _keyStartup = 'startup_enabled';
const _keyVolume = 'sound_volume';
const _keySoundFile = 'sound_file';
const _keyMinimizeOnClose = 'minimize_on_close';
const _keyAmbientEnabled = 'ambient_enabled';
const _keyAmbientFile    = 'ambient_file';
const _keyAmbientVolume  = 'ambient_volume';
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

  double get soundVolume => (_prefs.getInt(_keyVolume) ?? 80) / 100.0;

  Future<void> setVolume(int value) async {
    await _prefs.setInt(_keyVolume, value.clamp(0, 100));
  }

  String get soundFile => _prefs.getString(_keySoundFile) ?? 'notify.wav';

  Future<void> setSoundFile(String name) async {
    await _prefs.setString(_keySoundFile, name);
  }

  // ── Som ambiente ──────────────────────────────────────────────────────────

  bool get ambientEnabled => _prefs.getBool(_keyAmbientEnabled) ?? false;

  Future<void> setAmbientEnabled(bool value) async {
    await _prefs.setBool(_keyAmbientEnabled, value);
  }

  String get ambientFile => _prefs.getString(_keyAmbientFile) ?? 'rain.mp3';

  Future<void> setAmbientFile(String name) async {
    await _prefs.setString(_keyAmbientFile, name);
  }

  double get ambientVolume => (_prefs.getInt(_keyAmbientVolume) ?? 40) / 100.0;

  Future<void> setAmbientVolume(int value) async {
    await _prefs.setInt(_keyAmbientVolume, value.clamp(0, 100));
  }

  // ── Minimizar ao fechar ────────────────────────────────────────────────────

  bool get minimizeOnClose => _prefs.getBool(_keyMinimizeOnClose) ?? true;

  Future<void> setMinimizeOnClose(bool value) async {
    await _prefs.setBool(_keyMinimizeOnClose, value);
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
