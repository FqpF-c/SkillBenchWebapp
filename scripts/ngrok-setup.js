#!/usr/bin/env node

/**
 * Ngrok Setup Script
 * Easily toggle ngrok configuration on/off
 */

import fs from 'fs';
import path from 'path';

const envPath = '.env';
const envNgrokPath = '.env.ngrok';
const envBackupPath = '.env.backup';

function enableNgrok() {
  console.log('🚀 Enabling ngrok configuration...');

  // Backup current .env if it exists
  if (fs.existsSync(envPath)) {
    fs.copyFileSync(envPath, envBackupPath);
    console.log('✅ Backed up current .env to .env.backup');
  }

  // Copy ngrok environment variables
  if (fs.existsSync(envNgrokPath)) {
    const ngrokConfig = fs.readFileSync(envNgrokPath, 'utf8');
    const currentEnv = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';

    // Combine existing .env with ngrok config
    const combinedConfig = currentEnv + '\n\n# Ngrok Configuration\n' + ngrokConfig;
    fs.writeFileSync(envPath, combinedConfig);
    console.log('✅ Added ngrok configuration to .env');
  } else {
    console.error('❌ .env.ngrok file not found');
    process.exit(1);
  }

  console.log('🎉 Ngrok configuration enabled!');
  console.log('📝 Run "npm run dev:ngrok" to start with ngrok tunnel');
}

function disableNgrok() {
  console.log('🔄 Disabling ngrok configuration...');

  // Restore backup if it exists
  if (fs.existsSync(envBackupPath)) {
    fs.copyFileSync(envBackupPath, envPath);
    fs.unlinkSync(envBackupPath);
    console.log('✅ Restored original .env from backup');
  } else {
    // Remove ngrok-related lines from .env
    if (fs.existsSync(envPath)) {
      let envContent = fs.readFileSync(envPath, 'utf8');

      // Remove ngrok-related lines
      envContent = envContent
        .split('\n')
        .filter(line => !line.includes('VITE_USE_NGROK') &&
                       !line.includes('VITE_NGROK_URL') &&
                       !line.includes('VITE_APP_URL') &&
                       !line.includes('# Ngrok Configuration'))
        .join('\n')
        .replace(/\n\n\n+/g, '\n\n') // Clean up multiple newlines
        .trim();

      fs.writeFileSync(envPath, envContent);
      console.log('✅ Removed ngrok configuration from .env');
    }
  }

  console.log('✅ Ngrok configuration disabled!');
  console.log('📝 Run "npm run dev" for normal development');
}

function showStatus() {
  console.log('📊 Ngrok Configuration Status:');

  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const isNgrokEnabled = envContent.includes('VITE_USE_NGROK=true');
    console.log(`   Status: ${isNgrokEnabled ? '🟢 ENABLED' : '🔴 DISABLED'}`);

    if (isNgrokEnabled) {
      const ngrokUrlMatch = envContent.match(/VITE_NGROK_URL=(.+)/);
      if (ngrokUrlMatch) {
        console.log(`   URL: ${ngrokUrlMatch[1]}`);
      }
    }
  } else {
    console.log('   Status: 🔴 No .env file found');
  }

  console.log('\n📝 Available commands:');
  console.log('   node scripts/ngrok-setup.js enable   - Enable ngrok');
  console.log('   node scripts/ngrok-setup.js disable  - Disable ngrok');
  console.log('   node scripts/ngrok-setup.js status   - Show status');
}

// Main execution
const command = process.argv[2];

switch (command) {
  case 'enable':
    enableNgrok();
    break;
  case 'disable':
    disableNgrok();
    break;
  case 'status':
    showStatus();
    break;
  default:
    console.log('🔧 Ngrok Configuration Manager');
    console.log('\nUsage: node scripts/ngrok-setup.js [enable|disable|status]');
    showStatus();
}