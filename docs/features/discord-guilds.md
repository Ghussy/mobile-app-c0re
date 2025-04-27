# Discord Guilds Feature

## Checklist

- [ ] Create `discord_oauth_tokens` table in Supabase
- [ ] Add RLS policy for token security
- [ ] Create Edge Function for fetching guilds
- [ ] Add Discord client ID and secret to Supabase env
- [ ] Update front-end to capture tokens on sign-in
- [ ] Update front-end to use Edge Function for guild fetching
- [ ] Test token refresh flow
- [ ] Add error handling for token expiration

## Implementation Details

### Why We Need This

The Discord guilds feature lets us show users which c0re communities they can access based on their Discord server memberships. For example, if a user is in both "Gym Club" and "Climbing Club" Discord servers, we'll show them these communities in the app.

### Token Handling Challenge

- Discord access tokens expire in ~7 days (HTTP 401 after expiry)
- Supabase doesn't auto-refresh third-party tokens
- We need to handle refresh using provider_refresh_token
- Discord refresh requires a simple POST to /oauth2/token

### Recommended Implementation

#### 1. Token Storage (Supabase Table)

```sql
CREATE TABLE discord_oauth_tokens (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id),
  access_token text NOT NULL,
  refresh_token text NOT NULL,
  expires_at timestamp with time zone NOT NULL
);

-- RLS Policy
CREATE POLICY "own token" ON discord_oauth_tokens
  FOR ALL USING (auth.uid() = user_id);
```

#### 2. Edge Function (get-guilds.ts)

```typescript
const refreshToken = async (row) => {
  const body = new URLSearchParams({
    client_id: Deno.env.get("DISCORD_CLIENT_ID"),
    client_secret: Deno.env.get("DISCORD_CLIENT_SECRET"),
    grant_type: "refresh_token",
    refresh_token: row.refresh_token,
  });

  const r = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const { access_token, refresh_token, expires_in } = await r.json();

  await supabaseAdmin
    .from("discord_oauth_tokens")
    .update({
      access_token,
      refresh_token,
      expires_at: Date.now() + expires_in * 1000,
    })
    .eq("user_id", user.id);

  return access_token;
};
```

#### 3. Front-end Usage

```typescript
// On sign-in
const {
  data: { session },
} = await supabase.auth.getSession();
await supabase.from("discord_oauth_tokens").upsert({
  user_id: session.user.id,
  access_token: session.provider_token,
  refresh_token: session.provider_refresh_token,
  expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
});

// Fetching guilds
const { data: guilds } = await supabase.functions.invoke("get-guilds");
```

### Benefits

1. **On-demand** - Only fetch guild data when needed
2. **Secure** - Client never handles sensitive tokens
3. **Maintenance-free** - Token refresh handled server-side
4. **Real-time** - Always shows current server memberships

### Alternative Approaches

1. **Force re-login every 7 days**
   - Pros: Simple implementation
   - Cons: Poor user experience
2. **Client-side refresh**
   - Pros: No server needed
   - Cons: Requires exposing client secret

## Next Steps

1. Create the Supabase table and policy
2. Deploy the Edge Function
3. Add Discord credentials to Supabase
4. Update the front-end implementation
5. Test the complete flow
