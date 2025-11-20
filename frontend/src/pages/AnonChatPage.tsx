import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { io, Socket } from 'socket.io-client';
import { Send, Shield } from 'lucide-react';
import api from '../api/axios';

interface AnonMessage {
    id: number;
    message_text: string;
    sender_type: string;
    sent_at: string;
}

const AnonChatPage = () => {
    const { id } = useParams(); // Get session ID from URL if counselor
    const { token, user } = useAuth();
    const [sessionId, setSessionId] = useState<number | null>(id ? Number(id) : null);
    const [messages, setMessages] = useState<AnonMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [counselors, setCounselors] = useState<any[]>([]);
    const [selectedCounselor, setSelectedCounselor] = useState<number | null>(null);
    const socketRef = useRef<Socket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!id) {
            fetchCounselors();
        } else {
            // Counselor viewing existing session - load messages
            loadSessionMessages(Number(id));
        }
    }, []);

    useEffect(() => {
        if (sessionId) {
            // Initialize Socket
            socketRef.current = io('http://localhost:3000', {
                auth: { token }
            });

            socketRef.current.emit('join_anon_session', sessionId);

            socketRef.current.on('receive_anon_message', (message: AnonMessage) => {
                setMessages((prev) => [...prev, message]);
            });

            return () => {
                socketRef.current?.disconnect();
            };
        }
    }, [sessionId, token]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchCounselors = async () => {
        try {
            const res = await api.get('/counselors');
            setCounselors(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const loadSessionMessages = async (sid: number) => {
        try {
            const res = await api.get(`/anon-chat/${sid}`);
            setMessages(res.data.messages || []);
        } catch (err) {
            console.error(err);
        }
    };

    const startSession = async () => {
        if (!selectedCounselor) return;
        try {
            const res = await api.post('/anon-chat', { counselor_id: selectedCounselor });
            setSessionId(res.data.id);
        } catch (err) {
            console.error(err);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !socketRef.current || !sessionId) return;

        socketRef.current.emit('send_anon_message', {
            sessionId: sessionId,
            content: newMessage,
            senderType: user?.role === 'COUNSELOR' ? 'COUNSELOR' : 'STUDENT'
        });

        setNewMessage('');
    };

    if (!sessionId) {
        return (
            <div className="max-w-md mx-auto mt-10 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-center mb-6">
                    <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center">
                        <Shield className="h-8 w-8 text-gray-600" />
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Anonymous Consultation</h2>
                <p className="text-center text-gray-500 mb-6">Chat with a counselor without revealing your identity.</p>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Select Counselor</label>
                        <select
                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            onChange={(e) => setSelectedCounselor(Number(e.target.value))}
                            value={selectedCounselor || ''}
                        >
                            <option value="">-- Choose a Counselor --</option>
                            {counselors.map((c) => (
                                <option key={c.id} value={c.id}>{c.full_name}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={startSession}
                        disabled={!selectedCounselor}
                        className="w-full bg-gray-800 text-white py-3 rounded-lg hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                    >
                        Start Anonymous Chat
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                <h2 className="font-semibold text-gray-800 flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    Anonymous Session
                </h2>
                <span className="text-xs bg-gray-200 px-2 py-1 rounded text-gray-600">ID: {sessionId}</span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => {
                    const isMe = user?.role === 'STUDENT' ? msg.sender_type === 'STUDENT' : msg.sender_type === 'COUNSELOR';
                    return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] rounded-lg px-4 py-2 ${isMe ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-800'
                                }`}>
                                <p>{msg.message_text}</p>
                                <p className={`text-xs mt-1 ${isMe ? 'text-gray-400' : 'text-gray-400'}`}>
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
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500"
                />
                <button
                    type="submit"
                    className="bg-gray-800 text-white p-2 rounded-lg hover:bg-gray-900 transition-colors"
                >
                    <Send className="h-5 w-5" />
                </button>
            </form>
        </div>
    );
};

export default AnonChatPage;
