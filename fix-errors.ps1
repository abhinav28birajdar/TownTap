# PowerShell script to fix TypeScript errors in TownTap project

$files = @(
    "app\(tabs)\home.tsx",
    "app\(tabs)\explore.tsx",
    "app\auth\sign-in.tsx",
    "app\auth\sign-up.tsx",
    "app\profile.tsx",
    "app\notifications.tsx",
    "app\welcome.tsx",
    "app\customer\bookings.tsx",
    "app\customer\favorites.tsx",
    "app\customer\dashboard.tsx",
    "app\customer\search.tsx",
    "app\business-owner\dashboard.tsx"
)

foreach ($file in $files) {
    $path = "e:\programming\React Native\TownTap\$file"
    if (Test-Path $path) {
        Write-Host "Processing $file..."
        $content = Get-Content $path -Raw
        
        # Remove demo-related references
        $content = $content -replace 'isDemo\s*&&\s*[^:]+:', ''
        $content = $content -replace '\b(isDemo|demoBusinesses|demoCategories|demoBookings|currentUser)\b', 'false /* removed demo */'
        
        # Replace Colors. with colors. (from useColors hook)
        $content = $content -replace '\bColors\.', 'colors.'
        
        # Replace FontSize. with Typography.sizes.
        $content = $content -replace '\bFontSize\.', 'Typography.sizes.'
        
        # Replace BorderRadius. with BorderRadius from constants
        # (already imported in most files)
        
        # Add imports if missing
        if ($content -notmatch 'import.*useColors.*from') {
            $content = $content -replace '(import.*@/contexts/theme-context.*;)', "`$1`nimport { useColors } from '@/contexts/theme-context';"
        }
        
        if ($content -notmatch 'import.*Typography.*from.*theme') {
            $content = $content -replace '(import.*@/constants/theme.*;)', "`$1`nimport { Typography } from '@/constants/theme';"
        }
        
        Set-Content $path $content
        Write-Host "Fixed $file"
    }
}

Write-Host "Done!"
