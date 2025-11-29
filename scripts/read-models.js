import fs from 'fs';

try {
    // Try reading as UTF-16LE (common for PowerShell redirection)
    const content = fs.readFileSync('models.json', 'utf16le');
    // If that fails to parse, it might be UTF-8, but let's try to clean it up
    // Sometimes BOM or other artifacts are present.

    // Find the JSON part
    const jsonStart = content.indexOf('{');
    const jsonEnd = content.lastIndexOf('}');

    if (jsonStart === -1 || jsonEnd === -1) {
        console.error("Could not find JSON in file");
        process.exit(1);
    }

    const jsonStr = content.substring(jsonStart, jsonEnd + 1);
    const data = JSON.parse(jsonStr);

    if (data.models) {
        console.log("Available Models:");
        data.models.forEach(m => console.log(m.name));
    } else {
        console.log("No models found in response:", data);
    }

} catch (err) {
    console.error("Error reading models:", err);
}
