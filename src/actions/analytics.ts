'use server';

export async function askAnalyst(query: string) {
    try {
        const response = await fetch('http://127.0.0.1:8000/api/analytics', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: query }),
            cache: 'no-store',
        });

        if (!response.ok) {
            throw new Error(`Analytics Service Error: ${response.status}`);
        }

        const data = await response.json();
        return { success: true, analysis: data.response };
    } catch (error) {
        console.error('Error contacting analyst:', error);
        return { success: false, error: 'Failed to analyze data' };
    }
}
