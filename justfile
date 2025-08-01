export PATH := "./node_modules/.bin:" + env_var('PATH')
set script-interpreter := ['bun', 'run']
set shell := ['bun', 'exec']
set unstable

default:
  just --list

[script]
env: install
    import { input } from '@inquirer/prompts';
    const dotenv = Bun.file(".env");
    if (!await dotenv.exists()) {
        const supabase_url = await input({
            message: 'Enter your PUBLIC_SUPABASE_URL',
            required: true
        });
        const supabase_anon_key = await input({
            message: 'Enter your PUBLIC_SUPABASE_ANON_KEY',
            required: true
        });
        const google_maps_api_key = await input({
            message: 'Enter your GOOGLE_MAPS_API_KEY',
            required: true
        });
        await dotenv.write(`GOOGLE_MAPS_API_KEY=${google_maps_api_key}\nEXPO_PUBLIC_SUPABASE_URL=${supabase_url}\nEXPO_PUBLIC_SUPABASE_ANON_KEY=${supabase_anon_key}`)
    }
    

lint: install
    expo lint

test: install
    jest --watchAll

install:
    bun install

prebuild: env
    expo prebuild

run target: prebuild
    expo run:{{target}}

web: env
    expo start --web
