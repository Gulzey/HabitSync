Add-Type -AssemblyName System.Drawing
$ErrorActionPreference = "Stop"

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$outputRoot = Join-Path $root "store-assets\screenshots"

$devices = @(
  @{ Name = "phone"; Width = 1080; Height = 1920 },
  @{ Name = "7-inch-tablet"; Width = 1200; Height = 1920 },
  @{ Name = "10-inch-tablet"; Width = 1600; Height = 2560 }
)

$colors = @{
  Background = "#121212"
  Surface = "#1E1E1E"
  Elevated = "#242424"
  Border = "#303030"
  Text = "#FFFFFF"
  Muted = "#9A9A9A"
  Accent = "#BFA7FF"
  AccentSoft = "#2A2438"
  AccentText = "#D8C9FF"
}

function Color($hex) {
  return [System.Drawing.ColorTranslator]::FromHtml($hex)
}

function Font($size, $style = [System.Drawing.FontStyle]::Regular) {
  return [System.Drawing.Font]::new("Segoe UI", [single]$size, $style, [System.Drawing.GraphicsUnit]::Pixel)
}

function RoundedPath($x, $y, $w, $h, $r) {
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $d = $r * 2
  $path.AddArc($x, $y, $d, $d, 180, 90)
  $path.AddArc($x + $w - $d, $y, $d, $d, 270, 90)
  $path.AddArc($x + $w - $d, $y + $h - $d, $d, $d, 0, 90)
  $path.AddArc($x, $y + $h - $d, $d, $d, 90, 90)
  $path.CloseFigure()
  return $path
}

function FillRound($g, $brush, $x, $y, $w, $h, $r) {
  $path = RoundedPath $x $y $w $h $r
  $g.FillPath($brush, $path)
  $path.Dispose()
}

function StrokeRound($g, $pen, $x, $y, $w, $h, $r) {
  $path = RoundedPath $x $y $w $h $r
  $g.DrawPath($pen, $path)
  $path.Dispose()
}

function Text($g, $value, $font, $brush, $x, $y, $w, $h, $align = "Near") {
  $format = New-Object System.Drawing.StringFormat
  $format.Alignment = [System.Drawing.StringAlignment]::$align
  $format.LineAlignment = [System.Drawing.StringAlignment]::Near
  $rect = New-Object System.Drawing.RectangleF $x, $y, $w, $h
  $g.DrawString($value, $font, $brush, $rect, $format)
  $format.Dispose()
}

function DrawCheck($g, $x, $y, $size, $theme) {
  $accentBrush = New-Object System.Drawing.SolidBrush (Color $theme.Accent)
  $darkPen = New-Object System.Drawing.Pen (Color "#121212"), ([Math]::Max(5, $size * 0.1))
  FillRound $g $accentBrush $x $y $size $size ([int]($size * 0.28))
  $darkPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Square
  $darkPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Square
  $g.DrawLines($darkPen, @(
    (New-Object System.Drawing.PointF ($x + $size * 0.25), ($y + $size * 0.52)),
    (New-Object System.Drawing.PointF ($x + $size * 0.42), ($y + $size * 0.68)),
    (New-Object System.Drawing.PointF ($x + $size * 0.76), ($y + $size * 0.32))
  ))
  $darkPen.Dispose()
  $accentBrush.Dispose()
}

function DrawUnchecked($g, $x, $y, $size, $theme) {
  $brush = New-Object System.Drawing.SolidBrush (Color $theme.Elevated)
  $pen = New-Object System.Drawing.Pen (Color "#555555"), 3
  FillRound $g $brush $x $y $size $size ([int]($size * 0.28))
  StrokeRound $g $pen $x $y $size $size ([int]($size * 0.28))
  $brush.Dispose()
  $pen.Dispose()
}

function DrawHabitCard($g, $theme, $x, $y, $w, $h, $title, $streak, $checked, $scale) {
  $surface = New-Object System.Drawing.SolidBrush (Color $theme.Surface)
  $borderPen = New-Object System.Drawing.Pen (Color $theme.Border), 2
  $textBrush = New-Object System.Drawing.SolidBrush (Color $theme.Text)
  $accentBrush = New-Object System.Drawing.SolidBrush (Color $theme.AccentText)
  $badgeBrush = New-Object System.Drawing.SolidBrush (Color $theme.AccentSoft)
  $badgePen = New-Object System.Drawing.Pen (Color "#5B4B85"), 2

  FillRound $g $surface $x $y $w $h 18
  StrokeRound $g $borderPen $x $y $w $h 18

  Text $g $title (Font ([int](30 * $scale)) ([System.Drawing.FontStyle]::Bold)) $textBrush ($x + 28 * $scale) ($y + 22 * $scale) ($w - 150 * $scale) (44 * $scale)
  FillRound $g $badgeBrush ($x + 28 * $scale) ($y + 74 * $scale) (205 * $scale) (42 * $scale) 21
  StrokeRound $g $badgePen ($x + 28 * $scale) ($y + 74 * $scale) (205 * $scale) (42 * $scale) 21
  Text $g "$streak day streak" (Font ([int](18 * $scale)) ([System.Drawing.FontStyle]::Bold)) $accentBrush ($x + 50 * $scale) ($y + 83 * $scale) (180 * $scale) (28 * $scale)

  if ($checked) {
    DrawCheck $g ($x + $w - 92 * $scale) ($y + 39 * $scale) (62 * $scale) $theme
  } else {
    DrawUnchecked $g ($x + $w - 92 * $scale) ($y + 39 * $scale) (62 * $scale) $theme
  }

  $surface.Dispose()
  $borderPen.Dispose()
  $textBrush.Dispose()
  $accentBrush.Dispose()
  $badgeBrush.Dispose()
  $badgePen.Dispose()
}

function DrawWeeklyGraph($g, $theme, $x, $y, $w, $h, $values, $scale) {
  $surface = New-Object System.Drawing.SolidBrush (Color $theme.Surface)
  $borderPen = New-Object System.Drawing.Pen (Color $theme.Border), 2
  $textBrush = New-Object System.Drawing.SolidBrush (Color $theme.Text)
  $mutedBrush = New-Object System.Drawing.SolidBrush (Color $theme.Muted)
  $accentBrush = New-Object System.Drawing.SolidBrush (Color $theme.Accent)
  $trackBrush = New-Object System.Drawing.SolidBrush (Color $theme.Elevated)

  FillRound $g $surface $x $y $w $h 18
  StrokeRound $g $borderPen $x $y $w $h 18
  Text $g "Weekly progress" (Font ([int](28 * $scale)) ([System.Drawing.FontStyle]::Bold)) $textBrush ($x + 28 * $scale) ($y + 24 * $scale) ($w * 0.5) (42 * $scale)
  Text $g "Jun 1 - Jun 7" (Font ([int](18 * $scale)) ([System.Drawing.FontStyle]::Bold)) $mutedBrush ($x + 28 * $scale) ($y + 62 * $scale) ($w * 0.5) (30 * $scale)

  $days = @("Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun")
  $max = [Math]::Max(($values | Measure-Object -Maximum).Maximum, 1)
  $graphY = $y + 118 * $scale
  $barMax = $h - 195 * $scale
  $gap = $w / 7

  for ($i = 0; $i -lt 7; $i++) {
    $cx = $x + ($gap * $i) + ($gap / 2)
    $barH = [Math]::Max(18 * $scale, ($values[$i] / $max) * $barMax)
    Text $g ([string]$values[$i]) (Font ([int](18 * $scale)) ([System.Drawing.FontStyle]::Bold)) $textBrush ($cx - 25 * $scale) ($graphY - 30 * $scale) (50 * $scale) (24 * $scale) "Center"
    FillRound $g $trackBrush ($cx - 14 * $scale) $graphY (28 * $scale) $barMax 14
    FillRound $g $accentBrush ($cx - 14 * $scale) ($graphY + $barMax - $barH) (28 * $scale) $barH 14
    Text $g $days[$i] (Font ([int](16 * $scale)) ([System.Drawing.FontStyle]::Bold)) $mutedBrush ($cx - 35 * $scale) ($graphY + $barMax + 16 * $scale) (70 * $scale) (26 * $scale) "Center"
  }

  $surface.Dispose()
  $borderPen.Dispose()
  $textBrush.Dispose()
  $mutedBrush.Dispose()
  $accentBrush.Dispose()
  $trackBrush.Dispose()
}

function DrawBase($width, $height) {
  $bmp = New-Object System.Drawing.Bitmap $width, $height
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.Clear((Color $colors.Background))
  return @{ Bitmap = $bmp; Graphics = $g }
}

function DrawHeader($g, $theme, $width, $height, $headline, $subline, $scale) {
  $accentBrush = New-Object System.Drawing.SolidBrush (Color $theme.Accent)
  $textBrush = New-Object System.Drawing.SolidBrush (Color $theme.Text)
  $mutedBrush = New-Object System.Drawing.SolidBrush (Color $theme.Muted)
  $trackBrush = New-Object System.Drawing.SolidBrush (Color $theme.Elevated)

  $pad = 58 * $scale
  Text $g "HabitSync" (Font ([int](24 * $scale)) ([System.Drawing.FontStyle]::Bold)) $accentBrush $pad (50 * $scale) (300 * $scale) (40 * $scale)
  Text $g $headline (Font ([int](58 * $scale)) ([System.Drawing.FontStyle]::Bold)) $textBrush $pad (100 * $scale) ($width - $pad * 2) (76 * $scale)
  Text $g $subline (Font ([int](24 * $scale)) ([System.Drawing.FontStyle]::Bold)) $mutedBrush $pad (182 * $scale) ($width - $pad * 2) (40 * $scale)
  FillRound $g $trackBrush $pad (235 * $scale) ($width - $pad * 2) (16 * $scale) 8
  $progressBrush = New-Object System.Drawing.SolidBrush (Color $theme.Accent)
  FillRound $g $progressBrush $pad (235 * $scale) (($width - $pad * 2) * 0.72) (16 * $scale) 8

  $accentBrush.Dispose()
  $textBrush.Dispose()
  $mutedBrush.Dispose()
  $trackBrush.Dispose()
  $progressBrush.Dispose()
}

function ScreenshotDashboard($device) {
  $w = $device.Width
  $h = $device.Height
  $scale = $w / 1080
  $base = DrawBase $w $h
  $g = $base.Graphics
  DrawHeader $g $colors $w $h "Hi User" "72% complete today" $scale
  $pad = 58 * $scale
  DrawHabitCard $g $colors $pad (305 * $scale) ($w - $pad * 2) (142 * $scale) "Morning workout" 5 $true $scale
  DrawHabitCard $g $colors $pad (470 * $scale) ($w - $pad * 2) (142 * $scale) "Read 20 pages" 3 $true $scale
  DrawHabitCard $g $colors $pad (635 * $scale) ($w - $pad * 2) (142 * $scale) "Drink water" 9 $false $scale
  DrawWeeklyGraph $g $colors $pad ($h - 560 * $scale) ($w - $pad * 2) (410 * $scale) @(2, 4, 3, 5, 4, 1, 3) $scale
  Text $g "Small wins compound." (Font ([int](22 * $scale)) ([System.Drawing.FontStyle]::Bold)) (New-Object System.Drawing.SolidBrush (Color $colors.Muted)) $pad ($h - 110 * $scale) ($w - $pad * 2) (40 * $scale) "Center"
  return $base
}

function ScreenshotAdd($device) {
  $w = $device.Width
  $h = $device.Height
  $scale = $w / 1080
  $base = DrawBase $w $h
  $g = $base.Graphics
  DrawHeader $g $colors $w $h "Build better days" "Add habits and keep them visible" $scale
  $pad = 58 * $scale
  $surface = New-Object System.Drawing.SolidBrush (Color $colors.Surface)
  $borderPen = New-Object System.Drawing.Pen (Color $colors.Border), 2
  $textBrush = New-Object System.Drawing.SolidBrush (Color $colors.Text)
  $accentBrush = New-Object System.Drawing.SolidBrush (Color $colors.Accent)
  FillRound $g $surface $pad (320 * $scale) (($w - $pad * 2) * 0.72) (76 * $scale) 16
  StrokeRound $g $borderPen $pad (320 * $scale) (($w - $pad * 2) * 0.72) (76 * $scale) 16
  Text $g "New habit" (Font ([int](24 * $scale)) ([System.Drawing.FontStyle]::Bold)) (New-Object System.Drawing.SolidBrush (Color $colors.Muted)) ($pad + 26 * $scale) (340 * $scale) (400 * $scale) (36 * $scale)
  FillRound $g $accentBrush ($w - $pad - 190 * $scale) (320 * $scale) (190 * $scale) (76 * $scale) 16
  Text $g "Add" (Font ([int](25 * $scale)) ([System.Drawing.FontStyle]::Bold)) (New-Object System.Drawing.SolidBrush (Color "#121212")) ($w - $pad - 190 * $scale) (340 * $scale) (190 * $scale) (36 * $scale) "Center"
  DrawHabitCard $g $colors $pad (455 * $scale) ($w - $pad * 2) (142 * $scale) "Sleep before 11" 2 $true $scale
  DrawHabitCard $g $colors $pad (620 * $scale) ($w - $pad * 2) (142 * $scale) "Stretch" 7 $true $scale
  DrawHabitCard $g $colors $pad (785 * $scale) ($w - $pad * 2) (142 * $scale) "Journal" 1 $false $scale
  Text $g "Local-first. No account needed." (Font ([int](30 * $scale)) ([System.Drawing.FontStyle]::Bold)) $textBrush $pad ($h - 250 * $scale) ($w - $pad * 2) (50 * $scale) "Center"
  Text $g "Your habits stay on your device." (Font ([int](22 * $scale))) (New-Object System.Drawing.SolidBrush (Color $colors.Muted)) $pad ($h - 195 * $scale) ($w - $pad * 2) (42 * $scale) "Center"
  return $base
}

function ScreenshotGraph($device) {
  $w = $device.Width
  $h = $device.Height
  $scale = $w / 1080
  $base = DrawBase $w $h
  $g = $base.Graphics
  DrawHeader $g $colors $w $h "Track your week" "See goals completed each day" $scale
  $pad = 58 * $scale
  DrawWeeklyGraph $g $colors $pad (340 * $scale) ($w - $pad * 2) (560 * $scale) @(1, 3, 2, 4, 5, 3, 4) $scale
  DrawHabitCard $g $colors $pad (960 * $scale) ($w - $pad * 2) (142 * $scale) "Weekly review" 4 $true $scale
  DrawHabitCard $g $colors $pad (1125 * $scale) ($w - $pad * 2) (142 * $scale) "Plan tomorrow" 6 $false $scale
  Text $g "Flick between weeks and spot patterns." (Font ([int](26 * $scale)) ([System.Drawing.FontStyle]::Bold)) (New-Object System.Drawing.SolidBrush (Color $colors.AccentText)) $pad ($h - 190 * $scale) ($w - $pad * 2) (70 * $scale) "Center"
  return $base
}

function ScreenshotSettings($device) {
  $w = $device.Width
  $h = $device.Height
  $scale = $w / 1080
  $base = DrawBase $w $h
  $g = $base.Graphics
  $pad = 58 * $scale
  $textBrush = New-Object System.Drawing.SolidBrush (Color $colors.Text)
  $accentBrush = New-Object System.Drawing.SolidBrush (Color $colors.Accent)
  $mutedBrush = New-Object System.Drawing.SolidBrush (Color $colors.Muted)

  Text $g "HabitSync" (Font ([int](24 * $scale)) ([System.Drawing.FontStyle]::Bold)) $accentBrush $pad (70 * $scale) (300 * $scale) (40 * $scale)
  Text $g "Settings" (Font ([int](60 * $scale)) ([System.Drawing.FontStyle]::Bold)) $textBrush $pad (125 * $scale) ($w - $pad * 2) (80 * $scale)

  $cards = @(
    @{ Title = "Local-first tracking"; Desc = "Habit data is saved directly on this device."; On = $true; Badge = "" },
    @{ Title = "Cloud backup"; Desc = "Coming soon. Cloud backup is planned for later."; On = $false; Badge = "COMING SOON" },
    @{ Title = "Dark mode"; Desc = "Switch between dark and light screens."; On = $true; Badge = "" }
  )
  $y = 270 * $scale
  foreach ($card in $cards) {
    $surface = New-Object System.Drawing.SolidBrush (Color $colors.Surface)
    $borderPen = New-Object System.Drawing.Pen (Color $colors.Border), 2
    FillRound $g $surface $pad $y ($w - $pad * 2) (180 * $scale) 18
    StrokeRound $g $borderPen $pad $y ($w - $pad * 2) (180 * $scale) 18
    Text $g $card.Title (Font ([int](28 * $scale)) ([System.Drawing.FontStyle]::Bold)) $textBrush ($pad + 28 * $scale) ($y + 26 * $scale) ($w - $pad * 2 - 190 * $scale) (40 * $scale)
    if ($card.Badge -ne "") {
      $badgeBrush = New-Object System.Drawing.SolidBrush (Color $colors.AccentSoft)
      FillRound $g $badgeBrush ($pad + 28 * $scale) ($y + 72 * $scale) (210 * $scale) (38 * $scale) 19
      Text $g $card.Badge (Font ([int](15 * $scale)) ([System.Drawing.FontStyle]::Bold)) (New-Object System.Drawing.SolidBrush (Color $colors.AccentText)) ($pad + 28 * $scale) ($y + 82 * $scale) (210 * $scale) (24 * $scale) "Center"
      $badgeBrush.Dispose()
    }
    Text $g $card.Desc (Font ([int](20 * $scale))) $mutedBrush ($pad + 28 * $scale) ($y + 120 * $scale) ($w - $pad * 2 - 70 * $scale) (36 * $scale)

    $trackColor = if ($card.On) { $colors.Accent } else { "#2A2A2A" }
    FillRound $g (New-Object System.Drawing.SolidBrush (Color $trackColor)) ($w - $pad - 120 * $scale) ($y + 42 * $scale) (88 * $scale) (48 * $scale) 24
    FillRound $g (New-Object System.Drawing.SolidBrush (Color "#FFFFFF")) ($w - $pad - 78 * $scale) ($y + 48 * $scale) (36 * $scale) (36 * $scale) 18
    $y += 205 * $scale
    $surface.Dispose()
    $borderPen.Dispose()
  }

  Text $g "Cloud backup is marked coming soon for this release." (Font ([int](24 * $scale)) ([System.Drawing.FontStyle]::Bold)) $mutedBrush $pad ($h - 180 * $scale) ($w - $pad * 2) (60 * $scale) "Center"
  return $base
}

function SaveShot($device, $name, $builder) {
  $dir = Join-Path $outputRoot $device.Name
  New-Item -ItemType Directory -Force $dir | Out-Null
  $shot = & $builder $device
  $path = Join-Path $dir $name
  $shot.Bitmap.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $shot.Graphics.Dispose()
  $shot.Bitmap.Dispose()
}

foreach ($device in $devices) {
  SaveShot $device "01-dashboard.png" ${function:ScreenshotDashboard}
  SaveShot $device "02-add-habits.png" ${function:ScreenshotAdd}
  SaveShot $device "03-weekly-progress.png" ${function:ScreenshotGraph}
  SaveShot $device "04-settings.png" ${function:ScreenshotSettings}
}

Write-Host "Generated screenshots in $outputRoot"
