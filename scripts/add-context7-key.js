const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const envFilePath = path.join(__dirname, '..', '.env');

// Check if .env file exists
if (!fs.existsSync(envFilePath)) {
  console.error('.env file not found. Creating a new one...');
  fs.writeFileSync(envFilePath, '');
}

// Read current .env content
const envContent = fs.readFileSync(envFilePath, 'utf8');

// Check if CONTEXT7_API_KEY already exists
if (envContent.includes('CONTEXT7_API_KEY=')) {
  console.log('CONTEXT7_API_KEY already exists in .env file.');
  rl.close();
} else {
  rl.question('Enter your Context7 API key: ', (apiKey) => {
    if (!apiKey) {
      console.error('API key cannot be empty');
      rl.close();
      return;
    }

    // Add the API key to .env file
    const updatedContent = envContent + `\n# Context7 MCP API key for documentation and code examples\nCONTEXT7_API_KEY=${apiKey}\n`;
    fs.writeFileSync(envFilePath, updatedContent);
    
    console.log('CONTEXT7_API_KEY has been added to your .env file.');
    rl.close();
  });
}
