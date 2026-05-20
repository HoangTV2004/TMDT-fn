import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { io } from 'socket.io-client';
import { MessageCircle, Send, X, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './ChatWidget.css';

const API = import.meta.env.VITE_SERVER_API;

const ChatWidget = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [room, setRoom] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [unreadCount, setUnreadCount] = useState(0);

    const socketRef = useRef(null);
    const messagesEndRef = useRef(null);

    // Fetch room details and setup socket connection
    useEffect(() => {
        if (!user || user.role === 'admin') {
            // Disconnect socket if user logs out or is an admin (Admin has their own dashboard)
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
            setRoom(null);
            setMessages([]);
            setUnreadCount(0);
            return;
        }

        const setupChat = async () => {
            try {
                // 1. Get or create room
                const res = await fetch(`${API}/api/chat/room`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ customer_id: user.id })
                });
                const result = await res.json();
                if (result.success && result.data) {
                    const roomData = result.data;
                    setRoom(roomData);

                    // 2. Fetch initial messages
                    const messagesRes = await fetch(`${API}/api/chat/messages/${roomData.room_id}`);
                    const messagesResult = await messagesRes.json();
                    if (messagesResult.success) {
                        setMessages(messagesResult.data);
                        
                        // Calculate initial unread messages from admin
                        const unread = messagesResult.data.filter(
                            msg => msg.sender_role === 'admin' && !msg.is_read
                        ).length;
                        setUnreadCount(unread);
                    }

                    // 3. Connect Socket
                    const socket = io(API, { transports: ['websocket'] });
                    socketRef.current = socket;

                    socket.emit('join_chat_room', roomData.room_id);

                    socket.on('new_chat_message', (newMsg) => {
                        setMessages((prev) => {
                            // Avoid duplicate messages
                            if (prev.some(m => m.message_id === newMsg.message_id)) return prev;
                            return [...prev, newMsg];
                        });

                        // Unread management
                        if (newMsg.sender_role === 'admin') {
                            setUnreadCount((prev) => {
                                // If chat is open, immediately mark as read
                                if (isOpen) {
                                    socket.emit('mark_messages_read', { room_id: roomData.room_id, role: 'customer' });
                                    return 0;
                                }
                                return prev + 1;
                            });
                        }
                    });
                }
            } catch (error) {
                console.error('Error setting up customer chat:', error);
            }
        };

        setupChat();

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [user, user?.id]);

    // Handle chat panel open state
    useEffect(() => {
        if (isOpen && room && socketRef.current) {
            setUnreadCount(0);
            socketRef.current.emit('mark_messages_read', { room_id: room.room_id, role: 'customer' });
        }
        if (isOpen) {
            scrollToBottom();
        }
    }, [isOpen, room, messages]);

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!inputValue.trim() || !room || !socketRef.current) return;

        const messageData = {
            room_id: room.room_id,
            sender_id: user.id,
            sender_role: 'customer',
            message_text: inputValue.trim()
        };

        socketRef.current.emit('send_chat_message', messageData);
        setInputValue('');
        scrollToBottom();
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        try {
            const date = new Date(timestamp);
            return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        } catch (e) {
            return '';
        }
    };

    const handleLoginRedirect = () => {
        setIsOpen(false);
        navigate('/login');
    };

    return (
        <div className="chat-widget-container">
            {/* Floating button */}
            <button className="chat-trigger-btn" onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? <X size={24} /> : <MessageCircle size={28} />}
                {unreadCount > 0 && <span className="chat-unread-badge">{unreadCount}</span>}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="chat-window">
                    <div className="chat-header">
                        <div className="chat-header-info">
                            <div className="chat-avatar">AD</div>
                            <div className="chat-title">
                                <h4>Hỗ trợ trực tuyến</h4>
                                <p className="chat-status">
                                    <span className="chat-status-dot"></span>
                                    Admin đang online
                                </p>
                            </div>
                        </div>
                        <button className="chat-close-btn" onClick={() => setIsOpen(false)}>
                            <X size={20} />
                        </button>
                    </div>

                    {!user ? (
                        <div className="chat-login-prompt">
                            <AlertCircle size={40} color="#d0021b" />
                            <p>Vui lòng đăng nhập tài khoản khách hàng để bắt đầu cuộc trò chuyện với Admin.</p>
                            <button className="chat-login-prompt-btn" onClick={handleLoginRedirect}>
                                Đăng nhập ngay
                            </button>
                        </div>
                    ) : user.role === 'admin' ? (
                        <div className="chat-login-prompt">
                            <AlertCircle size={40} color="#fed100" />
                            <p style={{ fontWeight: 'bold', marginTop: '10px' }}>Tài khoản Admin</p>
                            <p style={{ fontSize: '13px', color: '#666', marginTop: '5px', textAlign: 'center', padding: '0 10px' }}>
                                Bạn đang đăng nhập bằng tài khoản Admin. Hãy sử dụng trang quản trị để phản hồi tin nhắn khách hàng.
                            </p>
                            <button className="chat-login-prompt-btn" onClick={() => { setIsOpen(false); navigate('/admin/chat'); }}>
                                Quản lý tin nhắn
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="chat-messages-body">
                                {messages.length === 0 ? (
                                    <div style={{ textAlign: 'center', color: '#8c8c8c', marginTop: '20px', fontSize: '13px' }}>
                                        Xin chào! Hãy để lại tin nhắn, Admin sẽ phản hồi bạn trong giây lát.
                                    </div>
                                ) : (
                                    messages.map((msg, index) => (
                                        <div key={msg.message_id || index} className={`chat-message-row ${msg.sender_role}`}>
                                            <div className="chat-bubble">
                                                {msg.message_text}
                                                <span className="chat-message-time">{formatTime(msg.created_at)}</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            <form className="chat-input-bar" onSubmit={handleSendMessage}>
                                <input
                                    type="text"
                                    placeholder="Nhập tin nhắn..."
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    maxLength={500}
                                />
                                <button className="chat-send-btn" type="submit" disabled={!inputValue.trim()}>
                                    <Send size={16} />
                                </button>
                            </form>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default ChatWidget;
