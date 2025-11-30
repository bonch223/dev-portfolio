async function testChat() {
    const url = 'https://mjre-portfolio.vercel.app/api/chat';
    const data = {
        message: "Tell me a joke about web developers.",
        history: []
    };

    try {
        console.log(`Sending request to ${url}...`);
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        console.log(`Status: ${response.status} ${response.statusText}`);
        const text = await response.text();
        console.log("Response:", text);

    } catch (error) {
        console.error("Error:", error);
    }
}

testChat();
