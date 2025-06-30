' Simple Expense Tracker VBScript Launcher
Option Explicit

Dim WshShell, strCurrentDir, strPowerShellPath, strScriptPath

' Create shell object
Set WshShell = CreateObject("WScript.Shell")

' Get current directory (where this VBS file is located)
strCurrentDir = WshShell.CurrentDirectory

' Set the working directory
WshShell.CurrentDirectory = strCurrentDir

' Get PowerShell path
strPowerShellPath = WshShell.RegRead("HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\PowerShell\1\ShellIds\Microsoft.PowerShell\Path")
If strPowerShellPath = "" Then
    strPowerShellPath = "powershell.exe"
End If

' Run the PowerShell script
strScriptPath = strCurrentDir & "\monitor-connection.ps1"

' Check if PowerShell script exists, otherwise fall back to batch file
If WshShell.FileExists(strScriptPath) Then
    WshShell.Run chr(34) & strPowerShellPath & chr(34) & " -ExecutionPolicy Bypass -File " & chr(34) & strScriptPath & chr(34), 1, False
Else
    ' Fall back to batch file if PowerShell script doesn't exist
    WshShell.Run chr(34) & strCurrentDir & "\start-expense-tracker.bat" & chr(34), 1, False
End If

' Clean up
Set WshShell = Nothing 