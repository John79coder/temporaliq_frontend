# Define base path (current directory by default)
$basePath = Get-Location

# Paths to remove if they exist
$srcPath = Join-Path $basePath "src"
$rootFiles = @("App.tsx", "main.tsx", "router.tsx")

# Remove existing src folder if it exists
if (Test-Path $srcPath) {
    Remove-Item -Recurse -Force $srcPath
}

# Remove root-level files if they exist
foreach ($file in $rootFiles) {
    $filePath = Join-Path $basePath $file
    if (Test-Path $filePath) {
        Remove-Item -Force $filePath
    }
}

# Define folder structure
$folders = @(
    "src/api",
    "src/components/layouts",
    "src/components/common",
    "src/components/auth",
    "src/components/onboarding",
    "src/components/dashboard",
    "src/stores",
    "src/hooks",
    "src/utils",
    "src/types",
    "src/styles",
    "src/pages"
)

# Define files
$files = @(
    # api
    "src/api/client.ts",
    "src/api/auth.ts",
    "src/api/notion.ts",
    "src/api/calendar.ts",
    "src/api/schedule.ts",

    # components/layouts
    "src/components/layouts/AppLayout.tsx",
    "src/components/layouts/AuthLayout.tsx",

    # components/common
    "src/components/common/Button.tsx",
    "src/components/common/Modal.tsx",
    "src/components/common/LoadingState.tsx",
    "src/components/common/Toast.tsx",
    "src/components/common/Input.tsx",

    # components/auth
    "src/components/auth/SignInForm.tsx",
    "src/components/auth/AppleSignInButton.tsx",
    "src/components/auth/EmailSignInForm.tsx",

    # components/onboarding
    "src/components/onboarding/OnboardingFlow.tsx",
    "src/components/onboarding/NotionConnect.tsx",
    "src/components/onboarding/CalendarConnect.tsx",
    "src/components/onboarding/SchedulePreview.tsx",

    # components/dashboard
    "src/components/dashboard/Dashboard.tsx",
    "src/components/dashboard/TaskList.tsx",
    "src/components/dashboard/CalendarView.tsx",
    "src/components/dashboard/SettingsModal.tsx",

    # stores
    "src/stores/authStore.ts",
    "src/stores/onboardingStore.ts",
    "src/stores/scheduleStore.ts",

    # hooks
    "src/hooks/useAuth.ts",
    "src/hooks/useToast.ts",
    "src/hooks/useApi.ts",

    # utils
    "src/utils/constants.ts",
    "src/utils/validators.ts",
    "src/utils/formatters.ts",
    "src/utils/storage.ts",

    # types
    "src/types/auth.ts",
    "src/types/notion.ts",
    "src/types/calendar.ts",
    "src/types/schedule.ts",

    # styles
    "src/styles/globals.css",

    # pages
    "src/pages/SignIn.tsx",
    "src/pages/Onboarding.tsx",
    "src/pages/Dashboard.tsx",
    "src/pages/Settings.tsx",
    "src/pages/Success.tsx",

    # root-level files
    "App.tsx",
    "main.tsx",
    "router.tsx"
)

# Create folders
foreach ($folder in $folders) {
    New-Item -Path (Join-Path $basePath $folder) -ItemType Directory -Force | Out-Null
}

# Create files
foreach ($file in $files) {
    $filePath = Join-Path $basePath $file
    New-Item -Path $filePath -ItemType File -Force | Out-Null
}

Write-Host "✅ Project structure created successfully."
