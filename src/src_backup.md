# /src folder removed to fix conflicts

The /src folder contained duplicate files with conflicting configurations:
- Used Tailwind v4 syntax vs main app using Tailwind v3
- Had .jsx files vs main app using .tsx files
- Different color definitions (oklch vs hsl)

This was causing the preview to load the wrong files and preventing the Augusta green background from showing.