Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -like '*next dev*' } | Select-Object ProcessId, CommandLine
Stop-Process -Id 2345

