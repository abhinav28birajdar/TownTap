# TownTap - Cleanup Duplicate Files
# Run this script to remove duplicate files identified in the transformation

Write-Host "🧹 TownTap Cleanup Script" -ForegroundColor Green
Write-Host "=========================" -ForegroundColor Green
Write-Host ""

$workspaceRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)

# List of duplicate files to remove
$duplicates = @(
    "constants\colors-enhanced.ts",
    "components\ui\error-boundary-enhanced.tsx",
    "hooks\use-theme-mode.ts",
    "hooks\use-theme-color.ts",
    "components\ui\themed-text-enhanced.tsx"
)

Write-Host "📋 Files to Remove:" -ForegroundColor Yellow
foreach ($file in $duplicates) {
    $fullPath = Join-Path $workspaceRoot $file
    if (Test-Path $fullPath) {
        Write-Host "   ✓ $file" -ForegroundColor White
    } else {
        Write-Host "   ⚠ $file (not found)" -ForegroundColor Gray
    }
}

Write-Host ""
$confirm = Read-Host "Continue with cleanup? (y/n)"

if ($confirm -ne 'y') {
    Write-Host "❌ Cleanup cancelled" -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "🗑️  Removing duplicate files..." -ForegroundColor Cyan

$removedCount = 0
$notFoundCount = 0

foreach ($file in $duplicates) {
    $fullPath = Join-Path $workspaceRoot $file
    
    if (Test-Path $fullPath) {
        try {
            Remove-Item $fullPath -Force
            Write-Host "   ✓ Removed: $file" -ForegroundColor Green
            $removedCount++
        } catch {
            Write-Host "   ✗ Failed to remove: $file" -ForegroundColor Red
            Write-Host "     Error: $_" -ForegroundColor Red
        }
    } else {
        Write-Host "   ⚠ Not found: $file" -ForegroundColor Gray
        $notFoundCount++
    }
}

Write-Host ""
Write-Host "📊 Summary:" -ForegroundColor Yellow
Write-Host "   Removed: $removedCount files" -ForegroundColor Green
Write-Host "   Not Found: $notFoundCount files" -ForegroundColor Gray
Write-Host ""

if ($removedCount -gt 0) {
    Write-Host "✅ Cleanup complete! Run 'npm start' to verify app still works." -ForegroundColor Green
} else {
    Write-Host "ℹ️  No files were removed." -ForegroundColor Cyan
}

Write-Host ""
Write-Host "💡 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Review TRANSFORMATION_REPORT.md" -ForegroundColor White
Write-Host "   2. Configure Supabase (database/schema.sql)" -ForegroundColor White
Write-Host "   3. Run manual tests (TEST_PLAN.md)" -ForegroundColor White
Write-Host "   4. Build for production" -ForegroundColor White
