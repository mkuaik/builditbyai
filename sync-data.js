const fs = require('fs');
const path = require('path');

// Read the tools-data.js file
const jsFilePath = path.join(__dirname, 'tools-data.js');
const jsFileContent = fs.readFileSync(jsFilePath, 'utf8');

// Use a regex to extract the array content
const match = jsFileContent.match(/const TOOLS_DATA = (\[[\s\S]*?\]);/);

if (!match) {
  console.error('Could not find TOOLS_DATA array in tools-data.js');
  process.exit(1);
}

const toolsDataStr = match[1];

// We need to evaluate the string to get the JS object
// Since it's a static array of objects, we can try to parse it or just use eval safely-ish here for this maintenance task
try {
  // Try to safely parse if it's strictly JSON (unlikely because of object keys and potential trailing commas)
  // Instead, let's just use a simple Node script to require it if it was a module, or just extract the data
  
  // A cleaner way: create a temp JS file that exports TOOLS_DATA and require it
  const tempJsPath = path.join(__dirname, 'temp_export.js');
  fs.writeFileSync(tempJsPath, jsFileContent + '\nmodule.exports = TOOLS_DATA;');
  
  const toolsData = require(tempJsPath);
  
  // Clean up
  fs.unlinkSync(tempJsPath);
  
  // Save to JSON
  const jsonFilePath = path.join(__dirname, 'data', 'tools.json');
  fs.writeFileSync(jsonFilePath, JSON.stringify(toolsData, null, 2), 'utf8');
  
  console.log('Successfully synced tools-data.js to data/tools.json');
} catch (err) {
  console.error('Error during sync:', err);
}
