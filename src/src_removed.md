# Conflicting /src folder removed

The /src folder contained duplicate .jsx files with Tailwind v4 syntax that was preventing the Augusta green background from displaying. 

Files removed:
- /src/App.jsx (duplicate of /App.tsx)
- /src/index.css (conflicted with /styles/globals.css)
- /src/main.jsx (duplicate of /main.tsx)
- All other /src subdirectories

The Augusta green background should now load properly from /styles/globals.css