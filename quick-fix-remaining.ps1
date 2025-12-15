# Quick fix for remaining files
$files = @(
    "app\messages\chat\[conversationId].tsx",
    "app\customer\notifications-list.tsx",
    "app\customer\loyalty-program.tsx",
    "app\customer\referral-program.tsx",
    "app\customer\wallet.tsx"
)

foreach ($file in $files) {
    Write-Host "Fixing: $file" -ForegroundColor Yellow
    
    $content = Get-Content "e:\programming\React Native\TownTap\$file" -Encoding UTF8 | Out-String
    
    # Add BorderRadius import if missing
    if ($content -notmatch "BorderRadius") {
        $content = $content -replace '(import .* from ''@/constants/spacing'';)', 'import { BorderRadius, spacing } from ''@/constants/spacing'';'
    }
    
    # Fix spacing references
    $content = $content -replace 'spacing\.base\b', 'spacing.md'
    $content = $content -replace 'spacing\.borderRadius\s*\*\s*2', 'BorderRadius.md * 2'
    $content = $content -replace 'spacing\.borderRadius\s*/\s*2', 'BorderRadius.md / 2'
    $content = $content -replace 'spacing\.borderRadius\b', 'BorderRadius.md'
    
    # Fix Colors.primary (should be colors.primary)
    $content = $content -replace 'Colors\.primary\b', 'colors.primary'
    
    # Fix missing color properties
    $content = $content -replace 'colors\.backgroundSecondary\b', 'colors.muted'
    $content = $content -replace 'colors\.inputPlaceholder\b', 'colors.textSecondary'
    
    # Add || '' to user?.id in .eq()
    $content = $content -replace '\.eq\(''user_id'',\s*user\?\.id\)', ".eq('user_id', user?.id || '')"
    $content = $content -replace '\.eq\(''receiver_id'',\s*user\?\.id\)', ".eq('receiver_id', user?.id || '')"
    
    # Add as any to Supabase updates
    $content = $content -replace '\.update\(\s*\{\s*is_read:\s*true\s*\}\s*\)', '.update({ is_read: true } as any)'
    $content = $content -replace '\.update\(\s*\{\s*updated_at:', '.update({ updated_at:'
    if ($content -match '\.update\(\s*\{\s*updated_at:.*?\}\s*\)' -and $content -notmatch 'as any') {
        $content = $content -replace '(\.update\(\s*\{\s*updated_at:[^\}]+\}\s*)\)', '$1 as any)'
    }
    
    # Add as any to insert calls
    $content = $content -replace '(\.insert\(\s*\{[^\}]+conversation_id:[^\}]+\}\s*)\)', '$1 as any)'
    
    # Add as any to rpc calls with params
    $content = $content -replace '(\.rpc\([^,]+,\s*\{[^\}]+\}\s*)\)', '$1 as any)'
    
    Set-Content "e:\programming\React Native\TownTap\$file" -Value $content -Encoding UTF8
    Write-Host "  ✓ Fixed" -ForegroundColor Green
}

Write-Host "All files processed!" -ForegroundColor Cyan
