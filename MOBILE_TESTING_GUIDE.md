# Mobile Testing Essentials (Expo Go + WSL)

Use this when testing on a real phone.

Core idea:
- App/proxy runs in WSL.
- Phone reaches your Windows IP.
- Windows forwards port `3001` to WSL.

## 0) One-time `.env` setup (WSL)

```bash
cd ~/work/Lucide_v2
cp -n .env.example .env
nano .env
```

Set:

```env
EXPO_PUBLIC_LLM_PROXY_URL=http://<WINDOWS_IPV4>:3001
OPENAI_API_KEY=your_real_key
OPENAI_MODEL=gpt-4o-mini
LLM_PROXY_PORT=3001
LLM_PROXY_HOST=0.0.0.0
```

Replace `<WINDOWS_IPV4>` with your Windows Wi-Fi/hotspot IPv4 (example: `172.20.10.2`).

## 1) Start proxy (WSL terminal A)

```bash
cd ~/work/Lucide_v2
npm run chat:proxy
```

## 2) Configure Windows -> WSL port forwarding (Admin PowerShell)

Important:
- Run in **Windows PowerShell as Administrator**.
- `netsh` does not work in WSL bash.

```powershell
$wslIp = (wsl hostname -I).Trim().Split(" ")[0]
netsh interface portproxy delete v4tov4 listenaddress=0.0.0.0 listenport=3001
netsh interface portproxy add v4tov4 listenaddress=0.0.0.0 listenport=3001 connectaddress=$wslIp connectport=3001
netsh advfirewall firewall add rule name="Lucide-Proxy-3001" dir=in action=allow protocol=TCP localport=3001
netsh interface portproxy show all
```

Expected mapping shape:
- `0.0.0.0:3001` -> `<WSL_IP>:3001`

## 3) Get the correct Windows IP (PowerShell)

```powershell
ipconfig
```

Use the IPv4 of your active Wi-Fi/hotspot adapter.

Do not use:
- WSL virtual adapter IP (often `172.25.x.x` on `vEthernet (WSL ...)`).

## 4) Verify proxy before opening app

PowerShell check:

```powershell
curl.exe http://localhost:3001/health
curl.exe http://<WINDOWS_IPV4>:3001/health
```

Note:
- In PowerShell, `curl` is an alias and can prompt security questions.
- Use `curl.exe` (or `irm`) to avoid that.

Phone check (same network / same hotspot):

```text
http://<WINDOWS_IPV4>:3001/health
```

Expected: JSON containing `"ok": true`.

## 5) Start Expo (WSL terminal B)

Use this startup command to avoid network-check crash on some connections:

```bash
cd ~/work/Lucide_v2
EXPO_NO_DEPENDENCY_VALIDATION=1 npx expo start --tunnel -c
```

Then scan QR with Expo Go.

## 6) Quick troubleshooting

- `netsh: command not found`: you ran it in WSL; use Admin PowerShell.
- Phone cannot reach `/health` but Windows can: hotspot/client isolation likely enabled.
- Expo startup shows `TypeError: fetch failed`: use `EXPO_NO_DEPENDENCY_VALIDATION=1`.
- Chatbot `Network error`: proxy not running, bad `EXPO_PUBLIC_LLM_PROXY_URL`, or bad port forward.
