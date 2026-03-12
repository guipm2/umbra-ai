'use server';

export async function sendMessageToAgent(message: string) {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl) {
            return { success: false, error: "API URL not configured" };
        }

        const response = await fetch(`${apiUrl}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message }),
            cache: 'no-store',
        });

        if (!response.ok) {
            const errText = await response.text().catch(() => "");
            console.error("Backend Error:", errText);
            throw new Error(`Backend responded with ${response.status}`);
        }

        const data = await response.json();
        return { success: true, message: data.response ?? data };
    } catch (error) {
        console.error('Error contacting agent:', error);
        return { success: false, error: 'Failed to communicate with AI agent' };
    }
}
