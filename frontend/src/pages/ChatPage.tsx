import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { io, Socket } from 'socket.io-client';
import { Send } from 'lucide-react';
import api from '../api/axios';

interface Message {
    id: number;
    message_text: string;
    sender_id: number;
    sender: { full_name: string };
    sent_at: string;
}

const ChatPage = () => {
    const { id } = useParams<{ id: string }>();
    const { user, token } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const socketRef = useRef<Socket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Initialize Socket
        socketRef.current = io('http://localhost:3000', {
            auth: { token }
        });

        socketRef.current.emit('join_session', id);

        socketRef.current.on('receive_message', (message: Message) => {
            setMessages((prev) => [...prev, message]);
        });

        // Fetch existing messages
        fetchHistory();

        return () => {
            socketRef.current?.disconnect();
        };
    }, [id, token]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchHistory = async () => {
        try {
            // We need an endpoint to get chat history. 
            // For now, we assume the socket handles real-time, but we need history.
            // I'll add a backend route for this later or now.
            // Let's assume GET /api/sessions/:id/chat exists.
            const res = await api.get(`/sessions/${id}/chat`);
            setMessages(res.data);
        } catch (err) {
            console.error('Failed to fetch chat history', err);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !socketRef.current) return;

        socketRef.current.emit('send_message', {
            sessionId: Number(id),
            content: newMessage
        });

        setNewMessage('');
    };

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50">
                <h2 className="font-semibold text-gray-800">Chat Session #{id}</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => {
                    const isMe = msg.sender_id === user?.id;
                    return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] rounded-lg px-4 py-2 ${isMe ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-800'
                                }`}>
                                {!isMe && <p className="text-xs font-medium mb-1 text-gray-500">{msg.sender.full_name}</p>}
                                <p>{msg.message_text}</p>
                                <p className={`text-xs mt-1 ${isMe ? 'text-green-100' : 'text-gray-400'}`}>
                                    {new Date(msg.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-4 border-t border-gray-100 flex gap-2">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                    type="submit"
                    className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                    <Send className="h-5 w-5" />
                </button>
            </form>
        </div>
    );
};

export default ChatPage;
