## Instructions to fix Augusta green background

1. Delete the entire `/src` folder to remove conflicting files:
```bash
rm -rf src
```

2. Clean install dependencies:
```bash
rm -rf node_modules package-lock.json
npm install
```

3. Run the development server:
```bash
npm run dev
```

The Augusta green background should now appear correctly!