'use server';

export async function generateContent(prompt: string, userId: string = "default") {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/content`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: prompt, user_id: userId }),
            cache: 'no-store',
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error("Backend Error:", errText);
            throw new Error(`AI Service Error: ${response.status}`);
        }

        const data = await response.json();
        return { success: true, content: data.response };
    } catch (error) {
        console.error('Error generating content:', error);
        return { success: false, error: 'Failed to generate content' };
    }
}
