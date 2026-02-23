import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Loader2 } from 'lucide-react';
import { useSocket } from '@/contexts/SocketContext';
import api from '@/lib/api';
import { toast } from 'sonner';
import { getFileUrl } from '@/lib/utils';

const ChatDialog = ({ member, isOpen, onClose, currentUser }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef(null);
    const { socket } = useSocket();

    // Scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Load conversation
    useEffect(() => {
        if (isOpen && member) {
            loadConversation();
            markAsRead();
        }
    }, [isOpen, member]);

    // Listen for new messages
    useEffect(() => {
        if (!socket || !member) return;

        const handleReceiveMessage = (data) => {
            if (data.senderId === member._id) {
                setMessages(prev => [...prev, {
                    sender: { _id: data.senderId },
                    content: data.content,
                    createdAt: data.timestamp
                }]);
                markAsRead();
            }
        };

        socket.on('receive_message', handleReceiveMessage);

        return () => {
            socket.off('receive_message', handleReceiveMessage);
        };
    }, [socket, member]);

    // Scroll when messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const loadConversation = async () => {
        setIsLoading(true);
        try {
            const res = await api.get(`/chat/conversation/${member._id}`);
            setMessages(res.data);
        } catch (error) {
            toast.error('Failed to load conversation');
        } finally {
            setIsLoading(false);
        }
    };

    const markAsRead = async () => {
        try {
            await api.put(`/chat/read/${member._id}`);
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || isSending) return;

        const messageContent = newMessage.trim();
        setNewMessage('');
        setIsSending(true);

        try {
            const res = await api.post('/chat/send', {
                receiverId: member._id,
                content: messageContent
            });

            // Add message to UI
            setMessages(prev => [...prev, res.data.data]);

            // Emit via socket
            if (socket) {
                socket.emit('send_message', {
                    receiverId: member._id,
                    content: messageContent
                });
            }
        } catch (error) {
            toast.error('Failed to send message');
            setNewMessage(messageContent); // Restore message
        } finally {
            setIsSending(false);
        }
    };

    if (!member) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] h-[600px] flex flex-col p-0">
                <DialogHeader className="p-6 pb-4 border-b">
                    <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                            <AvatarImage src={getFileUrl(member.profile?.avatar_url)} />
                            <AvatarFallback className="uppercase bg-accent">
                                {(member.profile?.full_name || member.email).charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <DialogTitle>{member.profile?.full_name || member.email}</DialogTitle>
                            <p className="text-xs text-muted-foreground">
                                {member.isOnline ? 'Online' : 'Offline'}
                            </p>
                        </div>
                    </div>
                </DialogHeader>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                            No messages yet. Start the conversation!
                        </div>
                    ) : (
                        messages.map((msg, index) => {
                            const isCurrentUser = msg.sender._id === currentUser?.id;
                            return (
                                <div
                                    key={index}
                                    className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[70%] rounded-2xl px-4 py-2 ${isCurrentUser
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-muted'
                                            }`}
                                    >
                                        <p className="text-sm">{msg.content}</p>
                                        <p className={`text-xs mt-1 ${isCurrentUser ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t">
                    <div className="flex gap-2">
                        <Input
                            placeholder="Type a message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            disabled={isSending}
                            className="flex-1"
                        />
                        <Button type="submit" disabled={!newMessage.trim() || isSending} size="icon">
                            {isSending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Send className="w-4 h-4" />
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default ChatDialog;
