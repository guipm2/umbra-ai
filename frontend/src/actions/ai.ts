'use server';

export async function generateContent(prompt: string, userId: string = "default") {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl) {
            return { success: false, error: "API URL not configured" };
        }

        const response = await fetch(`${apiUrl}/api/content`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: prompt, user_id: userId }),
            cache: 'no-store',
        });

        if (!response.ok) {
            const errText = await response.text().catch(() => "");
            console.error("Backend Error:", errText);
            throw new Error(`AI Service Error: ${response.status}`);
        }

        const data = await response.json();
        if (!data || typeof data.response !== "string") {
            throw new Error("Invalid response format from AI service");
        }
        return { success: true, content: data.response };
    } catch (error) {
        console.error('Error generating content:', error);
        return { success: false, error: 'Failed to generate content' };
    }
}
