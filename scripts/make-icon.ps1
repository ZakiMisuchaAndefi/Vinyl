# Membuat build/icon.ico multi-ukuran dari assets/icons/icon-512.png.
# Setiap ukuran disimpan sebagai PNG di dalam wadah ICO (didukung Windows Vista+).

Add-Type -AssemblyName System.Drawing

$repoRoot = Split-Path $PSScriptRoot -Parent
$source = Join-Path $repoRoot "assets\icons\icon-512.png"
$outDir = Join-Path $repoRoot "build"
$outFile = Join-Path $outDir "icon.ico"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$sizes = @(16, 24, 32, 48, 64, 128, 256)
$original = [System.Drawing.Image]::FromFile($source)
$images = New-Object System.Collections.ArrayList

foreach ($size in $sizes) {
    $bmp = New-Object System.Drawing.Bitmap($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $g.Clear([System.Drawing.Color]::Transparent)
    $g.DrawImage($original, 0, 0, $size, $size)
    $g.Dispose()

    $ms = New-Object System.IO.MemoryStream
    $bmp.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    [void]$images.Add(@{ Size = $size; Bytes = $ms.ToArray() })
    $ms.Dispose()
}
$original.Dispose()

$fs = [System.IO.File]::Create($outFile)
$writer = New-Object System.IO.BinaryWriter($fs)

# ICONDIR
$writer.Write([UInt16]0)                 # reserved
$writer.Write([UInt16]1)                 # type: icon
$writer.Write([UInt16]$images.Count)     # jumlah gambar

$offset = 6 + (16 * $images.Count)
foreach ($image in $images) {
    $dimension = if ($image.Size -ge 256) { 0 } else { $image.Size }
    $writer.Write([Byte]$dimension)      # lebar
    $writer.Write([Byte]$dimension)      # tinggi
    $writer.Write([Byte]0)               # jumlah warna palet
    $writer.Write([Byte]0)               # reserved
    $writer.Write([UInt16]1)             # bidang warna
    $writer.Write([UInt16]32)            # bit per piksel
    $writer.Write([UInt32]$image.Bytes.Length)
    $writer.Write([UInt32]$offset)
    $offset += $image.Bytes.Length
}

foreach ($image in $images) {
    $writer.Write([Byte[]]$image.Bytes)
}

$writer.Flush()
$writer.Dispose()
$fs.Dispose()

$info = Get-Item $outFile
"icon.ico dibuat: {0} ({1:N0} byte)" -f $info.FullName, $info.Length
