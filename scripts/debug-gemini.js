async function debugGemini() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("No GEMINI_API_KEY found");
        return;
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    console.log(`Listing Models URL: https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey.substring(0, 5)}...`);

    try {
        const response = await fetch(url);

        console.log(`Status: ${response.status} ${response.statusText}`);

        const responseText = await response.text();
        console.log("Response Body:");
        console.log(responseText);

    } catch (error) {
        console.error("Fetch error:", error);
    }
}

debugGemini();
