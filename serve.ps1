$port = 5173
$root = Split-Path -Parent $MyInvocation.MyCommand.Definition

$mimeTypes = @{
  '.html' = 'text/html; charset=utf-8'
  '.css'  = 'text/css'
  '.js'   = 'application/javascript'
  '.json' = 'application/json'
  '.png'  = 'image/png'
  '.svg'  = 'image/svg+xml'
  '.ico'  = 'image/x-icon'
  '.mp4'  = 'video/mp4'
  '.webm' = 'video/webm'
}

try {
  $listener = [System.Net.HttpListener]::new()
  $listener.Prefixes.Add("http://localhost:$port/")
  $listener.Start()
} catch {
  Write-Error "Failed to start listener: $_"
  exit 1
}

Write-Host "LifeSong preview running at http://localhost:$port"
[Console]::Out.Flush()

while ($listener.IsListening) {
  try {
    $ctx  = $listener.GetContext()
    $req  = $ctx.Request
    $res  = $ctx.Response

    $urlPath = $req.Url.LocalPath
    if ($urlPath -eq '/') { $urlPath = '/preview.html' }

    $filePath = Join-Path $root $urlPath.TrimStart('/')

    if (Test-Path $filePath -PathType Leaf) {
      $bytes = [System.IO.File]::ReadAllBytes($filePath)
      $ext   = [System.IO.Path]::GetExtension($filePath).ToLower()
      $mime  = if ($mimeTypes.ContainsKey($ext)) { $mimeTypes[$ext] } else { 'application/octet-stream' }

      $res.ContentType     = $mime
      $res.ContentLength64 = $bytes.Length
      $res.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
      $body  = [System.Text.Encoding]::UTF8.GetBytes('Not found')
      $res.StatusCode      = 404
      $res.ContentType     = 'text/plain'
      $res.ContentLength64 = $body.Length
      $res.OutputStream.Write($body, 0, $body.Length)
    }

    $res.Close()
  } catch {
    # swallow individual request errors
  }
}
