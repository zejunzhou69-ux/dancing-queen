[Console]::ForegroundColor = [ConsoleColor]::Green
Write-Host "=== Dancing Queen 部署助手 ===" -ForegroundColor Green
Write-Host ""
Write-Host "正在打开 Vercel 部署页面..." -ForegroundColor Yellow
Write-Host ""
Start-Process "https://vercel.com/new"
Write-Host "✓ 浏览器已打开" -ForegroundColor Green
Write-Host ""
Write-Host "请在浏览器中：" -ForegroundColor Cyan
Write-Host "  1. 点击 'Upload' 按钮" -ForegroundColor White
Write-Host "  2. 选择文件: dancing-queen-deploy.zip" -ForegroundColor White
Write-Host "  3. 点击 Deploy" -ForegroundColor White
Write-Host ""
Write-Host "文件位置: C:\Users\Admin1\Desktop\新建文件夹 (2)\dancing-queen-deploy.zip" -ForegroundColor Gray
