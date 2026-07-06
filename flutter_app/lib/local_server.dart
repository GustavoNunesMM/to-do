import 'dart:io';

/// Servidor HTTP mínimo, in-process, que serve o export estático do Next.js
/// (pasta `webapp/` ao lado do exe). Substitui o Node.js embutido — nenhum
/// processo externo roda em segundo plano.
class LocalWebServer {
  HttpServer? _server;

  static const _mime = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript',
    '.mjs': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.map': 'application/json',
    '.webmanifest': 'application/manifest+json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.otf': 'font/otf',
    '.wasm': 'application/wasm',
    '.txt': 'text/plain; charset=utf-8',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
  };

  /// Sobe o servidor em porta efêmera do loopback e retorna a URL base,
  /// ou null se a pasta não existir (ex.: rodando em debug sem build).
  Future<String?> start(String docRoot) async {
    final rootDir = Directory(docRoot);
    if (!rootDir.existsSync()) return null;
    final rootPath = rootDir.absolute.path;

    final server = await HttpServer.bind(InternetAddress.loopbackIPv4, 0);
    _server = server;

    server.listen((req) async {
      try {
        await _handle(req, rootPath);
      } catch (_) {
        try {
          req.response.statusCode = HttpStatus.internalServerError;
          await req.response.close();
        } catch (_) {}
      }
    });

    return 'http://127.0.0.1:${server.port}';
  }

  Future<void> _handle(HttpRequest req, String rootPath) async {
    var urlPath = Uri.decodeComponent(req.uri.path);
    if (urlPath.endsWith('/')) urlPath += 'index.html';

    var file = _resolve(rootPath, urlPath);

    // Rotas do Next sem extensão: tenta `rota.html`, senão SPA fallback.
    if ((file == null || !file.existsSync()) && !urlPath.contains('.')) {
      file = _resolve(rootPath, '$urlPath.html');
      if (file == null || !file.existsSync()) {
        file = File('$rootPath${Platform.pathSeparator}index.html');
      }
    }

    if (file == null || !file.existsSync()) {
      req.response.statusCode = HttpStatus.notFound;
      await req.response.close();
      return;
    }

    final dot = file.path.lastIndexOf('.');
    final ext = dot >= 0 ? file.path.substring(dot).toLowerCase() : '';
    req.response.headers.contentType =
        ContentType.parse(_mime[ext] ?? 'application/octet-stream');
    req.response.headers.set('cache-control', 'no-cache');
    await req.response.addStream(file.openRead());
    await req.response.close();
  }

  /// Resolve o caminho dentro de rootPath, bloqueando path traversal.
  File? _resolve(String rootPath, String urlPath) {
    final rel = urlPath.replaceAll('/', Platform.pathSeparator);
    final file = File('$rootPath$rel');
    final normalized = file.absolute.uri.normalizePath().toFilePath();
    if (!normalized.startsWith(rootPath)) return null;
    return File(normalized);
  }

  void close() {
    _server?.close(force: true);
    _server = null;
  }
}
