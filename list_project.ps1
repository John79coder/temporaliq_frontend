<# 
.SYNOPSIS
  Collect implementation file paths for a React + Vite frontend.

.DESCRIPTION
  - Includes: .html, .tsx, .ts (excludes .d.ts), .jsx, .js, .css, .scss, .sass, .less
  - Excludes folders: node_modules, .git, .idea (WebStorm), .vscode, dist/build, coverage, caches, etc.
  - Excludes files: lockfiles, .env*, logs, sourcemaps, ESLint/Prettier/Tailwind/Vite/TS configs, etc.
  - Skips test/story files: *.test.*, *.spec.*, *.stories.*

.PARAMETER Root
  Project root (default: current directory)

.PARAMETER OutFile
  Output file name (default: implementation-files.txt)

.EXAMPLE
  .\collect-implementation-files.ps1 -Root "C:\path\to\project" -OutFile "files.txt"
#>

param(
  [string]$Root = (Get-Location).Path,
  [string]$OutFile = "implementation-files.txt"
)

# ---- Includes (code/content you typically ship) ----
$IncludeExt = @(".html", ".tsx", ".ts", ".jsx", ".js", ".css", ".scss", ".sass", ".less")

# ---- Excluded directories (tools, caches, builds, IDE) ----
# Vite builds to /dist by default; WebStorm stores project data in .idea; node_modules is vendor code.
# (refs: Vite build guide & defaults; JetBrains docs; Node ignore best practices)
$IgnoreDirs = @(
  'node_modules', '.git', '.idea', '.vscode',
  'dist', 'build', 'coverage', 'out', 'storybook-static',
  '.cache', '.parcel-cache', '.turbo', '.pnpm-store', '.husky'
)

# ---- Excluded file names (not app logic) ----
$IgnoreFileNames = @(
  'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'bun.lockb',
  '.DS_Store', 'Thumbs.db', '.eslintcache'
)

# ---- Excluded globs/patterns (env, logs, maps, configs, tests/stories) ----
$IgnoreGlobs = @(
  # secrets & local env
  '.env', '.env.*',
  # logs & maps
  '*.log', '*.map',
  # configs (tooling, not app logic)
  'vite.config.*', 'vitest.config.*', 'tsconfig*.json',
  'tailwind.config.*', 'postcss.config.*',
  '.eslintrc*', '.prettierrc*', 'prettier.config.*', 'eslint.config.*',
  'jest.config.*', 'babel.config.*', 'commitlint.config.*',
  # tests & stories
  '*.test.*', '*.spec.*', '*.stories.*'
)

# Resolve root path
$rootPath = (Resolve-Path $Root).Path

# Collect results
$results = New-Object System.Collections.Generic.List[string]

Get-ChildItem -Path $rootPath -Recurse -File | ForEach-Object {
  $full = $_.FullName
  $rel = $full.Substring($rootPath.Length).TrimStart('\','/')
  $segments = $rel -split '[\\/]'

  # Exclude if any segment is an ignored directory
  if ($segments | Where-Object { $IgnoreDirs -contains $_ }) { return }

  # Extension include filter
  $ext = $_.Extension.ToLower()
  if (-not ($IncludeExt -contains $ext)) { return }

  # Exclude TS declaration files
  if ($ext -eq '.ts' -and $_.Name -like '*.d.ts') { return }

  # Exclude test/spec/story files
  if ($_.Name -match '\.(test|spec|stories)\.(t|j)sx?$') { return }

  # Exclude explicit filenames
  if ($IgnoreFileNames -contains $_.Name) { return }

  # Exclude glob patterns
  foreach ($g in $IgnoreGlobs) {
    if ($_.Name -like $g) { return }
  }

  # Keep valid implementation file
  $results.Add($rel)
}

$results.Sort()
$dest = Join-Path $rootPath $OutFile
$results | Set-Content -Path $dest -Encoding UTF8
Write-Host "✅ Wrote $($results.Count) file paths to $OutFile"
