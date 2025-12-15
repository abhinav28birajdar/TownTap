# Script to fix common TypeScript errors in TownTap project

Write-Host "Fixing common patterns across all .tsx files..." -ForegroundColor Green

$files = Get-ChildItem -Path "app" -Recurse -Filter "*.tsx"

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $modified = $false
    
    # Fix spacing.base -> spacing.md
    if ($content -match "spacing\.base") {
        $content = $content -replace "spacing\.base", "spacing.md"
        $modified = $true
        Write-Host "  Fixed spacing.base in $($file.Name)" -ForegroundColor Yellow
    }
    
    # Fix spacing.borderRadius -> BorderRadius.md
    if ($content -match "spacing\.borderRadius(?!\w)") {
        # Check if BorderRadius is imported
        if ($content -notmatch "import.*BorderRadius.*from") {
            $content = $content -replace "(import \{ spacing )", "`$1, BorderRadius"
        }
        $content = $content -replace "spacing\.borderRadius(?=\s*[,;\)\}])", "BorderRadius.md"
        $content = $content -replace "spacing\.borderRadius\s*\*\s*2", "BorderRadius.lg"
        $modified = $true
        Write-Host "  Fixed spacing.borderRadius in $($file.Name)" -ForegroundColor Yellow
    }
    
    # Fix Colors.primary -> colors.primary (when colors variable exists)
    if ($content -match "Colors\.primary" -and $content -match "const colors = Colors\[") {
        $content = $content -replace "Colors\.primary", "colors.primary"
        $modified = $true
        Write-Host "  Fixed Colors.primary in $($file.Name)" -ForegroundColor Yellow
    }
    
    # Fix colors.backgroundSecondary -> colors.muted
    if ($content -match "colors\.backgroundSecondary") {
        $content = $content -replace "colors\.backgroundSecondary", "colors.muted"
        $modified = $true
        Write-Host "  Fixed colors.backgroundSecondary in $($file.Name)" -ForegroundColor Yellow
    }
    
    if ($modified) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
    }
}

Write-Host "`nDone! Please check for any remaining issues." -ForegroundColor Green
