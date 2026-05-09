$body = @{
    messages = @(
        @{
            role    = "system"
            content = "You are a friendly assistant"
        },
        @{
            role    = "user"
            content = @"
Create a cinematic ultra realistic black hole website using React, Three.js, React Three Fiber and GLSL shaders.

Features:
- gravitational lensing
- glowing accretion disk
- swirling particles
- event horizon
- volumetric glow
- bloom effects
- nebula background
- realistic lighting
- smooth animations
- cinematic sci-fi design
- glassmorphism UI
- neon cyan and purple accents
- responsive layout
- optimized rendering
- particle systems
- animated space distortion
- post processing
- mouse interaction
- Tailwind CSS
- loading screen
- NASA + Interstellar inspired visuals

Goal:
Create a jaw dropping futuristic homepage.
"@
        }
    )
} | ConvertTo-Json -Depth 10

Invoke-RestMethod `
    -Uri "https://api.cloudflare.com/client/v4/accounts/YOUR_ACCOUNT_ID/ai/run/@cf/moonshotai/kimi-k2.6" `
    -Method POST `
    -Headers @{
    Authorization = "Bearer YOUR_API_TOKEN"
} `
    -Body $body `
    -ContentType "application/json"
