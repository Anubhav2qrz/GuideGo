"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { Send, ArrowLeft, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/auth-provider";
import { supabase } from "@/lib/supabase";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

type Message = {
  id: string;
  created_at: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read?: boolean;
};

function formatMessageTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}

function MessagesContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const bookingId = searchParams?.get("booking");
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sendError, setSendError] = useState<string | null>(null);
  const [receiverProfile, setReceiverProfile] = useState<{ id: string, full_name: string, avatar_url: string } | null>(null);
  const [loading, setLoading] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const currentUserId = user?.id;

  useEffect(() => {
    async function initChat() {
      if (!currentUserId || !bookingId) return;

      // Fetch booking to find the other person
      const { data: booking } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', bookingId)
        .single();

      if (!booking) {
        setLoading(false);
        return;
      }

      const isGuide = booking.guide_id === currentUserId;
      const receiverId = isGuide ? booking.traveler_id : booking.guide_id;

      // Fetch receiver profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', receiverId)
        .single();

      if (profile) {
        setReceiverProfile({ ...profile, id: receiverId });
      }

      // Fetch messages between these two
      const { data: msgs } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${currentUserId})`)
        .order('created_at', { ascending: true });
        
      if (msgs) setMessages(msgs);
      setLoading(false);

      // Subscribe to new messages
      const channel = supabase
        .channel(`chat:${bookingId}`)
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          // Note: In a real production app, RLS filters this for us.
        }, (payload) => {
          const newMsg = payload.new as Message;
          if (
            (newMsg.sender_id === currentUserId && newMsg.receiver_id === receiverId) ||
            (newMsg.sender_id === receiverId && newMsg.receiver_id === currentUserId)
          ) {
            setMessages((prev) => [...prev, newMsg]);
          }
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }

    initChat();
  }, [currentUserId, bookingId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !receiverProfile || !currentUserId) return;
    setSendError(null);

    const { error } = await supabase.from('messages').insert([
      {
        sender_id: currentUserId,
        receiver_id: receiverProfile.id,
        content: newMessage.trim(),
      }
    ]);

    if (error) {
      console.error("Supabase error:", error);
      setSendError(`Failed to send: ${error.message}`);
    } else {
      setNewMessage("");
    }
  };

  if (!bookingId) {
    return (
      <div className="min-h-screen pt-24 pb-16 bg-muted/20 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-bold mb-2">No conversation selected</h2>
          <p className="text-muted-foreground mb-6">Please select a booking from your dashboard to start a conversation.</p>
          <Button asChild className="bg-brand-blue text-white">
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="min-h-screen pt-32 text-center">Loading chat...</div>;
  }

  return (
    <div className="min-h-screen pt-24 pb-8 bg-muted/20 flex flex-col">
      <div className="mx-auto w-full max-w-4xl px-4 flex-1 flex flex-col h-[calc(100vh-140px)]">
        
        <div className="mb-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        <div className="bg-card border rounded-t-2xl p-4 flex items-center gap-4 shadow-sm z-10">
          <div className="h-12 w-12 rounded-full overflow-hidden bg-muted">
            <img src={receiverProfile?.avatar_url || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80"} alt="User" className="h-full w-full object-cover" />
          </div>
          <div>
            <h2 className="font-bold text-lg">{receiverProfile?.full_name || 'Unknown User'}</h2>
            <p className="text-sm text-brand-emerald flex items-center gap-1.5 font-medium">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-emerald opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-emerald" />
              </span>
              Online
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-card border-x p-4 space-y-3 shadow-inner">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <p className="font-medium">No messages yet</p>
                <p className="text-sm mt-1">Say hello to start the conversation! 👋</p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, idx) => {
                const isMe = msg.sender_id === currentUserId;
                // Show date separator between messages on different days
                const prevMsg = idx > 0 ? messages[idx - 1] : null;
                const currentDate = new Date(msg.created_at).toDateString();
                const prevDate = prevMsg ? new Date(prevMsg.created_at).toDateString() : null;
                const showDateSeparator = currentDate !== prevDate;

                return (
                  <div key={msg.id}>
                    {showDateSeparator && (
                      <div className="flex items-center gap-4 my-4">
                        <div className="flex-1 h-px bg-border" />
                        <span className="text-xs text-muted-foreground font-medium px-2">
                          {new Date(msg.created_at).toLocaleDateString("en-IN", { 
                            weekday: "short", month: "short", day: "numeric" 
                          })}
                        </span>
                        <div className="flex-1 h-px bg-border" />
                      </div>
                    )}
                    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] group ${
                        isMe 
                          ? 'rounded-2xl rounded-br-sm' 
                          : 'rounded-2xl rounded-bl-sm'
                      }`}>
                        <div className={`px-4 py-2.5 ${
                          isMe 
                            ? 'bg-brand-blue text-white' 
                            : 'bg-muted/50 border'
                        } rounded-2xl ${isMe ? 'rounded-br-sm' : 'rounded-bl-sm'}`}>
                          <p className="text-sm">{msg.content}</p>
                        </div>
                        <p className={`text-[10px] mt-1 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ${
                          isMe ? 'text-right' : 'text-left'
                        }`}>
                          {formatMessageTime(msg.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="bg-card border rounded-b-2xl shadow-sm flex flex-col">
          {sendError && (
            <div className="px-4 py-2 bg-destructive/10 text-destructive text-sm border-b border-destructive/20 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {sendError}
            </div>
          )}
          <form onSubmit={handleSendMessage} className="p-4 flex gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 h-12 rounded-xl bg-muted/50 border px-4 outline-none focus:border-brand-blue transition-colors"
            />
            <Button type="submit" disabled={!newMessage.trim()} className="h-12 w-12 rounded-xl bg-brand-blue hover:bg-brand-blue-dark text-white p-0">
              <Send className="h-5 w-5" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-32 text-center">Loading...</div>}>
      <MessagesContent />
    </Suspense>
  );
}
