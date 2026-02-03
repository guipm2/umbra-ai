'use client';

import { useState } from 'react';
import { sendMessageToAgent } from '@/actions/chat';

export default function ChatPage() {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<{ role: 'user' | 'agent'; content: string }[]>([]);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = input;
        setInput('');
        setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
        setLoading(true);

        const result = await sendMessageToAgent(userMsg);

        setLoading(false);
        if (result.success && result.message) {
            setMessages((prev) => [...prev, { role: 'agent', content: result.message }]);
        } else {
            setMessages((prev) => [...prev, { role: 'agent', content: 'Error: Could not reach agent.' }]);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-8">
            <h1 className="text-3xl font-bold mb-8 text-purple-400">Aura AI Agent</h1>

            <div className="w-full max-w-2xl bg-gray-800 rounded-lg p-6 min-h-[500px] flex flex-col">
                <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`p-3 rounded-lg max-w-[80%] ${msg.role === 'user'
                                    ? 'bg-purple-600 self-end ml-auto'
                                    : 'bg-gray-700 self-start mr-auto'
                                }`}
                        >
                            <strong>{msg.role === 'user' ? 'You' : 'Agent'}:</strong> {msg.content}
                        </div>
                    ))}
                    {loading && <div className="text-gray-400 italic">Agent is thinking...</div>}
                </div>

                <form onSubmit={handleSubmit} className="flex gap-2">
                    <input
                        type="text"
                        className="flex-1 p-3 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:border-purple-500"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask something..."
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded font-bold disabled:opacity-50"
                        disabled={loading}
                    >
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
}
