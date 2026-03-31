# Fix Supabase TypeScript Types

## Problem
The manually created types file doesn't match the exact structure Supabase SDK expects, causing `never` type errors.

## Solution: Regenerate Types with Supabase CLI

### Step 1: Install Supabase CLI
```bash
npm install -g supabase
```

### Step 2: Login to Supabase
```bash
supabase login
```

### Step 3: Link Your Project
```bash
supabase link --project-ref YOUR_PROJECT_REF
```
*Get YOUR_PROJECT_REF from your Supabase dashboard URL: `https://app.supabase.com/project/YOUR_PROJECT_REF`*

### Step 4: Generate Types
```bash
npx supabase gen types typescript --linked > lib/supabase/database.types.ts
```

### Step 5: Update Client Files
Replace the import in `lib/supabase/client.ts` and `lib/supabase/server.ts`:

```typescript
// OLD
import { Database } from './types'

// NEW
import { Database } from './database.types'
```

### Step 6: Remove `as any` Casts
Go back to `app/admin/(protected)/categories/page.tsx` and remove the `as any`:

```typescript
// Change this:
const { error } = await supabase.from('categories').insert(newCategory as any)

// Back to this:
const { error } = await supabase.from('categories').insert(newCategory)
```

## Why This Works
- Supabase CLI generates types that exactly match what the SDK expects
- It includes all necessary type helpers and metadata
- Auto-generates correct Insert/Update/Upsert types for all tables
- Handles edge cases like JSON fields, arrays, enums properly

## Alternative: Update Packages
If regenerating doesn't work, try updating Supabase packages:

```bash
npm install @supabase/supabase-js@latest @supabase/ssr@latest
npm run build
```



