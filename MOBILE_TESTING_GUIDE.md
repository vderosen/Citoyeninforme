# Mobile Testing Guide (Expo Go + WSL)

Use this to run the app on your phone and make chatbot work.

## 1) Configure `.env` in WSL

```bash
cd ~/work/Lucide_v2
cp -n .env.example .env
nano .env
```

Set:

```env
EXPO_PUBLIC_LLM_PROXY_URL=http://10.25.4.176:3001
OPENAI_API_KEY=your_real_key
OPENAI_MODEL=gpt-4o-mini
LLM_PROXY_PORT=3001
LLM_PROXY_HOST=0.0.0.0
```

## 2) Start proxy (WSL terminal A)

```bash
cd ~/work/Lucide_v2
npm run chat:proxy
```

## 3) Forward Windows port 3001 to WSL (Admin PowerShell)

```powershell
$wslIp = (wsl hostname -I).Trim().Split(" ")[0]
netsh interface portproxy delete v4tov4 listenaddress=0.0.0.0 listenport=3001
netsh interface portproxy add v4tov4 listenaddress=0.0.0.0 listenport=3001 connectaddress=$wslIp connectport=3001
netsh advfirewall firewall add rule name="Lucide-Proxy-3001" dir=in action=allow protocol=TCP localport=3001
```

## 4) Verify from phone

Phone (same Wi-Fi): open

```text
http://10.25.4.176:3001/health
```

Expected: JSON with `"ok": true`.

## 5) Start Expo (WSL terminal B)

```bash
cd ~/work/Lucide_v2
npx expo start --tunnel -c
```

Scan QR with Expo Go.

## 6) If it fails

- `/health` not reachable: port-forward or firewall issue.
- Chatbot `Network error`: proxy not running or wrong `EXPO_PUBLIC_LLM_PROXY_URL`.
- After `.env` changes, restart Expo with `-c`.

