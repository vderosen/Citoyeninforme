# Chatbot Setup (Beginner Friendly)

This app needs a **local proxy server** for chatbot requests.
Your OpenAI key stays in the proxy, never in the mobile app code.

## 1) Create your local env file

```bash
cp .env.example .env
```

Open `.env` and set at least:

- `OPENAI_API_KEY=...` (your real key)
- `EXPO_PUBLIC_LLM_PROXY_URL=http://localhost:3001`

Optional:

- `OPENAI_MODEL=gpt-4o-mini`
- `LLM_PROXY_PORT=3001`
- `LLM_PROXY_HOST=0.0.0.0`

## 2) Start the proxy

In terminal A:

```bash
npm run chat:proxy
```

Check it is alive:

```bash
curl -s http://localhost:3001/health
```

Expected response:

```json
{"ok":true,"model":"gpt-4o-mini","hasApiKey":true}
```

If `hasApiKey` is `false`, your `.env` key is missing or invalid.

## 3) Start Expo

In terminal B:

```bash
npx expo start -c
```

Then test chatbot from the app.

## 4) If using a physical phone (Expo Go)

`localhost` on your phone is not your computer.
Set:

```bash
EXPO_PUBLIC_LLM_PROXY_URL=http://YOUR_COMPUTER_IP:3001
```

Then restart Expo (`npx expo start -c`).

## 5) Quick troubleshooting

- `API error: 500`: usually `OPENAI_API_KEY` missing in `.env`.
- `Network error`: proxy not running, wrong URL, or blocked port.
- chatbot never streams: check proxy terminal for upstream OpenAI error.

