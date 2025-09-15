# 🌐 Ngrok Integration for SkillBench

This setup allows you to easily test your app with ngrok tunneling to access real Firebase data with proper usernames and authentication.

## 🚀 Quick Start

### 1. Enable Ngrok
```bash
npm run ngrok:enable
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development with Ngrok
```bash
npm run dev:ngrok
```

This will:
- Start your Vite dev server on localhost:3000
- Create an ngrok tunnel at `https://skillbench-dev.ngrok.io`
- Automatically configure your app to use the ngrok URL

## 📝 Available Commands

| Command | Description |
|---------|-------------|
| `npm run ngrok:enable` | Enable ngrok configuration |
| `npm run ngrok:disable` | Disable ngrok configuration and restore normal dev |
| `npm run ngrok:status` | Check current ngrok configuration status |
| `npm run dev:ngrok` | Start dev server with ngrok tunnel |
| `npm run ngrok:start` | Start ngrok tunnel only |
| `npm run ngrok:stop` | Stop ngrok tunnel |

## 🔧 How It Works

1. **Configuration**: Ngrok settings are stored in `ngrok.yml`
2. **Environment Variables**: When enabled, adds ngrok-specific env vars to `.env`
3. **Firebase Integration**: Automatically updates Firebase config to use ngrok URL
4. **Easy Toggle**: Simple enable/disable mechanism with backup/restore

## 📁 Files Created

- `ngrok.yml` - Ngrok configuration with your auth token
- `.env.ngrok` - Environment variables for ngrok mode
- `scripts/ngrok-setup.js` - Toggle script for easy enable/disable
- `.env.backup` - Backup of your original .env (created when enabling)

## 🔄 To Disable and Remove

```bash
npm run ngrok:disable
```

This will:
- Restore your original `.env` file
- Remove all ngrok-related environment variables
- Your app will work normally on localhost again

## 🗑️ Complete Removal

To completely remove ngrok integration:

1. Disable ngrok: `npm run ngrok:disable`
2. Delete files:
   ```bash
   rm ngrok.yml
   rm .env.ngrok
   rm scripts/ngrok-setup.js
   rm NGROK_README.md
   ```
3. Remove npm scripts from `package.json`:
   - `dev:ngrok`
   - `ngrok:enable`
   - `ngrok:disable`
   - `ngrok:status`
   - `ngrok:start`
   - `ngrok:stop`
4. Remove `concurrently` from devDependencies
5. Remove ngrok-related code from `src/config/firebase.js`

## 🔒 Security Note

Your ngrok auth token is stored in `ngrok.yml`. Make sure this file is in your `.gitignore` to keep your token secure.

## 💡 Usage Tips

- Use ngrok mode when you need to test with real Firebase data
- The ngrok URL is fixed (`https://skillbench-dev.ngrok.io`) for consistent testing
- Remember to disable ngrok when done testing to avoid confusion
- Check status anytime with `npm run ngrok:status`