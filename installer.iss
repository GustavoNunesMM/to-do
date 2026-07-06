#define AppName "To-Do Timer"
#define AppVersion "1.0.0"
#define AppPublisher "Gustavo"
#define AppExeName "flutter_app.exe"
#define ReleaseDir "flutter_app\build\windows\x64\runner\Release"

[Setup]
AppId={{B3F2A1C4-7E8D-4F9A-B2C3-D4E5F6A7B8C9}
AppName={#AppName}
AppVersion={#AppVersion}
AppPublisher={#AppPublisher}
DefaultDirName={autopf}\{#AppName}
DefaultGroupName={#AppName}
OutputDir=dist
OutputBaseFilename=ToDoTimer-Setup-{#AppVersion}
SetupIconFile={#ReleaseDir}\data\flutter_assets\assets\icon.ico
Compression=lzma2/ultra64
SolidCompression=yes
WizardStyle=modern
ArchitecturesInstallIn64BitMode=x64compatible
MinVersion=10.0

[Languages]
Name: "brazilianportuguese"; MessagesFile: "compiler:Languages\BrazilianPortuguese.isl"

[Tasks]
Name: "desktopicon"; Description: "Criar atalho na área de trabalho"; GroupDescription: "Ícones adicionais:"; Flags: unchecked
Name: "startupicon"; Description: "Iniciar com o Windows"; GroupDescription: "Opções de inicialização:"; Flags: unchecked

[Files]
; Executável principal e DLLs Flutter
Source: "{#ReleaseDir}\{#AppExeName}";          DestDir: "{app}"; Flags: ignoreversion
Source: "{#ReleaseDir}\*.dll";                   DestDir: "{app}"; Flags: ignoreversion recursesubdirs
; Next.js webapp (export estático, servido pelo próprio exe)
Source: "{#ReleaseDir}\webapp\*";               DestDir: "{app}\webapp"; Flags: ignoreversion recursesubdirs createallsubdirs
; Flutter assets (sons, icones, etc)
Source: "{#ReleaseDir}\data\*";                 DestDir: "{app}\data"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{group}\{#AppName}";          Filename: "{app}\{#AppExeName}"
Name: "{group}\Desinstalar {#AppName}"; Filename: "{uninstallexe}"
Name: "{autodesktop}\{#AppName}";    Filename: "{app}\{#AppExeName}"; Tasks: desktopicon

[Registry]
; Iniciar com Windows (opcional, via task)
Root: HKCU; Subkey: "Software\Microsoft\Windows\CurrentVersion\Run"; ValueType: string; ValueName: "{#AppName}"; ValueData: """{app}\{#AppExeName}"""; Flags: uninsdeletevalue; Tasks: startupicon

[Run]
Filename: "{app}\{#AppExeName}"; Description: "Iniciar {#AppName}"; Flags: nowait postinstall skipifsilent

[UninstallDelete]
Type: filesandordirs; Name: "{app}"
