const fs = require('fs');
const path = require('path');

// Function to recursively find all .tsx and .ts files
function findTsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      findTsFiles(filePath, fileList);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Function to check for unterminated string literals
function checkForUnterminatedStrings(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check for lines with odd number of double quotes (potential unterminated string)
      const doubleQuotes = (line.match(/"/g) || []).length;
      if (doubleQuotes % 2 !== 0 && !line.includes('//') && !line.trim().startsWith('*')) {
        console.log(`Potential unterminated string in ${filePath} at line ${i + 1}:`);
        console.log(`  ${line}`);
      }
      
      // Check for lines with odd number of single quotes (potential unterminated string)
      const singleQuotes = (line.match(/'/g) || []).length;
      if (singleQuotes % 2 !== 0 && !line.includes('//') && !line.trim().startsWith('*')) {
        console.log(`Potential unterminated string in ${filePath} at line ${i + 1}:`);
        console.log(`  ${line}`);
      }
    }
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
  }
}

// Main function
function main() {
  const srcDir = path.join(__dirname, 'src');
  const tsFiles = findTsFiles(srcDir);
  
  console.log(`Found ${tsFiles.length} TypeScript files to check`);
  
  tsFiles.forEach(file => {
    checkForUnterminatedStrings(file);
  });
}

main();
