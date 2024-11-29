const fs = require('fs');
const path = require('path');
const os = require('os');

// Path to your .env file
const envPath = path.resolve(__dirname, '.env');

// Function to get the local machine's IP address
function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  throw new Error('Unable to find local IP address');
}

// Function to detect and set local IP or Azure URL
function setupEnv() {
  const envFileContent = fs.readFileSync(envPath, { encoding: 'utf8' });
  let updatedEnvFile = envFileContent;

  // Check if USE_LOCAL is set to true
  const useLocal = /USE_LOCAL=true/.test(envFileContent);

  if (useLocal) {
    console.log('Using Local Configuration');
    try {
      const localIp = getLocalIpAddress();

      if (/LOCAL_IP=/.test(envFileContent)) {
        updatedEnvFile = updatedEnvFile.replace(/LOCAL_IP=.*/, `LOCAL_IP=${localIp}`);
      } else {
        updatedEnvFile += `\nLOCAL_IP=${localIp}`;
      }

      fs.writeFileSync(envPath, updatedEnvFile);
      console.log(`LOCAL_IP set to: ${localIp}`);
    } catch (error) {
      console.error('Error fetching local IP address:', error);
    }
  } else {
    console.log('Using Azure Configuration');
  }
}

console.log('Setting up environment...');
setupEnv();
