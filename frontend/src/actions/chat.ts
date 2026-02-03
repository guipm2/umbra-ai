'use server';

export async function sendMessageToAgent(message: string) {
    try {
        const response = await fetch('http://127.0.0.1:8000/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message }),
            cache: 'no-store',
        });

        if (!response.ok) {
            throw new Error(`Backend responded with ${response.status}`);
        }

        const data = await response.json();
        return { success: true, message: data.response };
    } catch (error) {
        console.error('Error contacting agent:', error);
        return { success: false, error: 'Failed to communicate with AI agent' };
    }
}
