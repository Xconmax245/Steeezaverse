Add-Type -AssemblyName System.Drawing
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$path = Join-Path $root "public/photo_2026-09-09_21-08-39.jpg"
$bmp = New-Object System.Drawing.Bitmap($path)
$w = $bmp.Width; $h = $bmp.Height
Write-Output ("DIMS {0} x {1}" -f $w, $h)

$rect = New-Object System.Drawing.Rectangle(0, 0, $w, $h)
$data = $bmp.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadOnly, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
$stride = $data.Stride
$len = $stride * $h
$buf = New-Object byte[] $len
[System.Runtime.InteropServices.Marshal]::Copy($data.Scan0, $buf, 0, $len)
$bmp.UnlockBits($data)
$bmp.Dispose()

$stepX = [Math]::Max(1, [Math]::Floor($w / 480))
$stepY = [Math]::Max(1, [Math]::Floor($h / 360))

$blue = New-Object System.Collections.ArrayList
$red  = New-Object System.Collections.ArrayList
$yel  = New-Object System.Collections.ArrayList

for ($y = 0; $y -lt $h; $y += $stepY) {
  $rowOff = $y * $stride
  for ($x = 0; $x -lt $w; $x += $stepX) {
    $o = $rowOff + $x * 3
    $b = $buf[$o]; $g = $buf[$o + 1]; $r = $buf[$o + 2]
    if (($b - $r) -gt 40 -and ($b - $g) -gt 25 -and $b -gt 90) { [void]$blue.Add(@($x, $y)) }
    elseif (($r - $g) -gt 55 -and ($r - $b) -gt 55 -and $r -gt 90) { [void]$red.Add(@($x, $y)) }
    elseif ($r -gt 150 -and $g -gt 110 -and ($r - $b) -gt 60 -and ($g - $b) -gt 40) { [void]$yel.Add(@($x, $y)) }
  }
}

function F2($v, $max) { return [Math]::Round($v / $max, 3) }

function Stats($pts, $name) {
  if ($pts.Count -eq 0) { Write-Output ("{0}: NONE" -f $name); return }
  $sx = 0.0; $sy = 0.0
  $minx = 1e9; $maxx = -1.0; $miny = 1e9; $maxy = -1.0
  foreach ($p in $pts) {
    $sx += $p[0]; $sy += $p[1]
    if ($p[0] -lt $minx) { $minx = $p[0] }
    if ($p[0] -gt $maxx) { $maxx = $p[0] }
    if ($p[1] -lt $miny) { $miny = $p[1] }
    if ($p[1] -gt $maxy) { $maxy = $p[1] }
  }
  $n = $pts.Count
  $cx = $sx / $n; $cy = $sy / $n
  Write-Output ("{0}: n={1} bboxFx=({2}..{3}) bboxFy=({4}..{5}) centroidF=({6},{7})" -f $name, $n, (F2 $minx $w), (F2 $maxx $w), (F2 $miny $h), (F2 $maxy $h), (F2 $cx $w), (F2 $cy $h))

  $bins = New-Object int[] 40
  foreach ($p in $pts) {
    $bi = [int][Math]::Floor($p[0] * 40 / $w)
    if ($bi -ge 40) { $bi = 39 }
    $bins[$bi]++
  }
  Write-Output ("  xhist40: " + (($bins | ForEach-Object { $_ }) -join ","))

  $ybins = New-Object int[] 24
  foreach ($p in $pts) {
    $bi = [int][Math]::Floor($p[1] * 24 / $h)
    if ($bi -ge 24) { $bi = 23 }
    $ybins[$bi]++
  }
  Write-Output ("  yhist24: " + (($ybins | ForEach-Object { $_ }) -join ","))
  return $cy
}

$blueCy = Stats $blue "BLUE"
$redCy  = Stats $red  "RED"
$yelCy  = Stats $yel  "YELLOW"

# Torso extents measured at the chest band (centroid +/- 6% of height)
function BandStats($pts, $cy, $name) {
  if ($pts.Count -eq 0) { return }
  $lo = $cy - 0.06 * $h; $hi = $cy + 0.06 * $h
  $minx = 1e9; $maxx = -1.0; $n = 0
  foreach ($p in $pts) {
    if ($p[1] -ge $lo -and $p[1] -le $hi) {
      $n++
      if ($p[0] -lt $minx) { $minx = $p[0] }
      if ($p[0] -gt $maxx) { $maxx = $p[0] }
    }
  }
  if ($n -gt 0) {
    Write-Output ("{0} chest band: n={1} torsoFx={2}..{3} widthF={4}" -f $name, $n, (F2 $minx $w), (F2 $maxx $w), (F2 ($maxx - $minx) $w))
  }
}
BandStats $blue $blueCy "BLUE"
BandStats $red  $redCy  "RED"
BandStats $yel  $yelCy  "YELLOW"
