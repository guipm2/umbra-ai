'use server';

export async function askAnalyst(query: string) {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl) {
            return { success: false, error: "API URL not configured" };
        }

        const response = await fetch(`${apiUrl}/api/analytics`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: query }),
            cache: 'no-store',
        });

        if (!response.ok) {
            const errText = await response.text().catch(() => "");
            console.error("Backend Error:", errText);
            throw new Error(`Analytics Service Error: ${response.status}`);
        }

        const data = await response.json();
        return { success: true, analysis: data.response };
    } catch (error) {
        console.error('Error contacting analyst:', error);
        return { success: false, error: 'Failed to analyze data' };
    }
}
