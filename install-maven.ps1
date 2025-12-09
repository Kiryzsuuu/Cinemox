# Maven Manual Installation Script
$mavenVersion = "3.9.9"
$mavenUrl = "https://dlcdn.apache.org/maven/maven-3/$mavenVersion/binaries/apache-maven-$mavenVersion-bin.zip"
$downloadPath = "$env:TEMP\apache-maven.zip"
$installPath = "C:\Program Files\Apache\maven"

Write-Host "Downloading Maven $mavenVersion..." -ForegroundColor Green
Invoke-WebRequest -Uri $mavenUrl -OutFile $downloadPath

Write-Host "Extracting Maven..." -ForegroundColor Green
Expand-Archive -Path $downloadPath -DestinationPath "$env:TEMP\maven-extract" -Force

Write-Host "Installing Maven to $installPath..." -ForegroundColor Green
if (Test-Path $installPath) {
    Remove-Item $installPath -Recurse -Force
}
New-Item -ItemType Directory -Path $installPath -Force | Out-Null
Copy-Item -Path "$env:TEMP\maven-extract\apache-maven-$mavenVersion\*" -Destination $installPath -Recurse -Force

Write-Host "Setting up environment variables..." -ForegroundColor Green
[Environment]::SetEnvironmentVariable("MAVEN_HOME", $installPath, "Machine")
$path = [Environment]::GetEnvironmentVariable("Path", "Machine")
if ($path -notlike "*$installPath\bin*") {
    [Environment]::SetEnvironmentVariable("Path", "$path;$installPath\bin", "Machine")
}

Write-Host "Cleaning up..." -ForegroundColor Green
Remove-Item $downloadPath -Force
Remove-Item "$env:TEMP\maven-extract" -Recurse -Force

Write-Host "`nMaven installed successfully!" -ForegroundColor Green
Write-Host "Please restart your terminal and run: mvn -version" -ForegroundColor Yellow
Write-Host "`nOr refresh environment variables with:" -ForegroundColor Yellow
Write-Host '$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")' -ForegroundColor Cyan
