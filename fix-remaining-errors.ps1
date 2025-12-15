# Fix remaining TypeScript errors in TownTap project

Write-Host "Fixing remaining errors..." -ForegroundColor Green

# Files to fix
$files = @(
    "app\business-reviews\``[businessId``].tsx",
    "app\messages\chat\``[conversationId``].tsx",
    "app\customer\live-tracking\``[bookingId``].tsx"
)

foreach ($file in $files) {
    $fullPath = "e:\programming\React Native\TownTap\$file"
    Write-Host "Processing: $file"
    
    if (Test-Path $fullPath) {
        $content = Get-Content $fullPath | Out-String
        
        # Fix spacing.base
        $content = $content -replace 'spacing\.base', 'spacing.md'
        
        # Fix spacing.borderRadius
        $content = $content -replace 'spacing\.borderRadius\s*\*\s*2', 'BorderRadius.md * 2'
        $content = $content -replace 'spacing\.borderRadius', 'BorderRadius.md'
        
        # Fix Colors.primary  (should be colors.primary)
        $content = $content -replace 'Colors\.primary', 'colors.primary'
        
        # Fix colors.backgroundSecondary
        $content = $content -replace 'colors\.backgroundSecondary', 'colors.muted'
        
        # Fix colors.inputPlaceholder
        $content = $content -replace 'colors\.inputPlaceholder', 'colors.textSecondary'
        
        # Write back
        Set-Content $fullPath -Value $content
        Write-Host "  Fixed: $file" -ForegroundColor Yellow
    } else {
        Write-Host "  Not found: $file" -ForegroundColor Red
    }
}

Write-Host "Done!" -ForegroundColor Green
