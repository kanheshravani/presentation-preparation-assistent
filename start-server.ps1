<#
.SYNOPSIS
    Starts a zero-dependency local static web server for Presentation Preparation Assistant
    using native Windows PowerShell .NET HttpListener.

.DESCRIPTION
    Hosts the application at http://localhost:8080 and opens your default browser.
#>

param(
    [int]$Port = 8080
)

$Host.UI.RawUI.WindowTitle = "Presentation Preparation Assistant Server"
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  Presentation Preparation Assistant for 3rd Year CE" -ForegroundColor White
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Starting local web server on port $Port..." -ForegroundColor Yellow

$listener = New-Object System.Net.HttpListener
$prefix = "http://localhost:$Port/"
$listener.Prefixes.Add($prefix)

try {
    $listener.Start()
} catch {
    Write-Warning "Could not start on port $Port ($($_.Exception.Message)). Trying port 8081..."
    $Port = 8081
    $prefix = "http://localhost:$Port/"
    $listener = New-Object System.Net.HttpListener
    $listener.Prefixes.Add($prefix)
    $listener.Start()
}

$url = "http://localhost:$Port/"
Write-Host "`nServer is running at: $url" -ForegroundColor Green
Write-Host "Press Ctrl+C in this console to stop the server.`n" -ForegroundColor Gray

# Open default browser
Start-Process $url

$rootPath = $PSScriptRoot

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $rawUrl = $request.Url.LocalPath.TrimStart('/')
        if ([string]::IsNullOrWhiteSpace($rawUrl)) {
            $rawUrl = "index.html"
        }

        $filePath = Join-Path $rootPath $rawUrl

        if (Test-Path $filePath -PathType Leaf) {
            $contentBytes = [System.IO.File]::ReadAllBytes($filePath)
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            
            $mimeType = switch ($ext) {
                ".html" { "text/html; charset=utf-8" }
                ".css"  { "text/css; charset=utf-8" }
                ".js"   { "application/javascript; charset=utf-8" }
                ".json" { "application/json; charset=utf-8" }
                ".png"  { "image/png" }
                ".jpg"  { "image/jpeg" }
                ".svg"  { "image/svg+xml" }
                Default { "application/octet-stream" }
            }

            $response.ContentType = $mimeType
            $response.ContentLength64 = $contentBytes.Length
            $response.StatusCode = 200
            $response.OutputStream.Write($contentBytes, 0, $contentBytes.Length)
        } else {
            $response.StatusCode = 404
            $notFoundBytes = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
            $response.OutputStream.Write($notFoundBytes, 0, $notFoundBytes.Length)
        }
        $response.Close()
    } catch {
        # Handle termination gracefully
        break
    }
}
