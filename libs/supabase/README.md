# @conecteja/supabase

Supabase client library for Conecteja.

## Description

This library provides two functions to create Supabase clients:
- `createClient()` - Creates a client with anon key for client-side operations
- `createAdminClient()` - Creates an admin client with service role key for server-side operations

## Usage

### Client (with anon key)

```typescript
import { createClient } from '@conecteja/supabase';

const supabase = createClient();
```

### Admin Client (with service role key)

⚠️ **Warning**: The admin client bypasses Row Level Security (RLS) policies. Use only on the server side.

```typescript
import { createAdminClient } from '@conecteja/supabase';

const supabaseAdmin = createAdminClient();
```

## Environment Variables

### For Client (createClient)

The client will check the following environment variables in order:
- `SUPABASE_URL` or `EXPO_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` or `EXPO_PUBLIC_SUPABASE_ANON_KEY` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key

### For Admin Client (createAdminClient)

The admin client will check the following environment variables in order:
- `SUPABASE_URL` or `EXPO_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` or `SUPABASE_SERVICE_ROLE` - Your Supabase service role key

**Note:** The library supports different naming conventions for different platforms:
- Use `EXPO_PUBLIC_*` prefix for React Native/Expo apps
- Use `NEXT_PUBLIC_*` prefix for Next.js apps
- Use plain names for Node.js/server-side applications

## Building

Run `nx build supabase` to build the library.

## Running unit tests

Run `nx test supabase` to execute the unit tests via [Jest](https://jestjs.io).
