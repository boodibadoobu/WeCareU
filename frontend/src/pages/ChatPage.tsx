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
    const [status, setStatus] = useState<string>('');
    const socketRef = useRef<Socket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

        // Initialize Socket
        socketRef.current = io(socketUrl, {
            auth: { token },
            extraHeaders: {
                'ngrok-skip-browser-warning': 'true'
            },
            transportOptions: {
                polling: {
                    extraHeaders: {
                        'ngrok-skip-browser-warning': 'true'
                    }
                }
            }
        });

        socketRef.current.on('connect', () => {
            console.log('Socket connected successfully');
        });

        socketRef.current.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
        });

        socketRef.current.emit('join_session', id);

        socketRef.current.on('receive_message', (message: Message) => {
            console.log('Message received:', message);
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
            const res = await api.get(`/sessions/${id}/chat`);
            // Handle both old format (array) and new format (object) just in case
            if (Array.isArray(res.data)) {
                setMessages(res.data);
            } else {
                setMessages(res.data.messages);
                setStatus(res.data.status);
            }
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
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <h2 className="font-semibold text-gray-800">Chat Session #{id}</h2>
                {status && (
                    <span className={`px-2 py-1 rounded text-xs font-medium ${status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' :
                        status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                            'bg-gray-100 text-gray-700'
                        }`}>
                        {status}
                    </span>
                )}
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

            {status === 'COMPLETED' ? (
                <div className="p-4 border-t border-gray-100 bg-gray-50 text-center">
                    <p className="text-gray-500 italic">
                        This Session Has been completed. You cannot send or receive more message from this chat
                    </p>
                </div>
            ) : (
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
            )}
        </div>
    );
};

export default ChatPage;
