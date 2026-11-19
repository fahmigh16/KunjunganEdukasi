Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\USER\.gemini\antigravity-ide\brain\c7c519c6-f571-4c7f-84e2-e6a63bf6587a\media__1790340983295.jpg"
$destDir = "d:\SEMPROOO\KunjunganEdukasi-main\KunjunganEdukasi-main\frontend\public\assets"

if (-not (Test-Path $destDir)) {
    New-Item -ItemType Directory -Path $destDir -Force
}

$sourceImg = [System.Drawing.Image]::FromFile($srcPath)
Write-Host "Source image size: $($sourceImg.Width) x $($sourceImg.Height)"

# Copy full poster
$sourceImg.Save("$destDir\poster_full.jpg", [System.Drawing.Imaging.ImageFormat]::Jpeg)

function Crop-Image($xPct, $yPct, $wPct, $hPct, $outFile) {
    $x = [int]($sourceImg.Width * $xPct)
    $y = [int]($sourceImg.Height * $yPct)
    $w = [int]($sourceImg.Width * $wPct)
    $h = [int]($sourceImg.Height * $hPct)

    $rect = New-Object System.Drawing.Rectangle($x, $y, $w, $h)
    $bmp = New-Object System.Drawing.Bitmap($w, $h)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.DrawImage($sourceImg, 0, 0, $rect, [System.Drawing.GraphicsUnit]::Pixel)
    $g.Dispose()

    $bmp.Save("$destDir\$outFile", [System.Drawing.Imaging.ImageFormat]::Jpeg)
    $bmp.Dispose()
    Write-Host "Saved $outFile ($w x $h)"
}

# 1. Top main hero photo (group of kids shouting in blue uniforms)
Crop-Image 0.15 0.00 0.85 0.36 "hero_kids_group.jpg"

# 2. Outdoor students group sitting
Crop-Image 0.71 0.49 0.28 0.10 "outdoor_students.jpg"

# 3. Melon/fruit greenhouse inspection
Crop-Image 0.45 0.56 0.27 0.13 "greenhouse_melon.jpg"

# 4. Cooking / Baking class
Crop-Image 0.47 0.69 0.27 0.13 "cooking_baking.jpg"

# 5. Hydroponic Bok Choy inspection
Crop-Image 0.73 0.60 0.26 0.14 "hydroponic_bokchoy.jpg"

# 6. Tangkap Ikan Koi (girl with big fish)
Crop-Image 0.78 0.75 0.21 0.15 "koi_fish.jpg"

# 7. Top Logos
Crop-Image 0.01 0.01 0.44 0.06 "polinela_logos.jpg"

$sourceImg.Dispose()
