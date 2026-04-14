import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchStudyRoom } from '@/api/community';
import { useAppSelector } from '@/redux/hooks';
import { getSocket } from '@/lib/socket';
import { Play, Coffee, Brain, Users, ArrowLeft, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RoomState {
  status: 'focus' | 'break' | 'idle';
  timeRemaining: number;
  participantCount: number;
}

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export const StudyRoomNode: React.FC = () => {
  const { slug, roomId } = useParams<{ slug: string; roomId: string }>();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  const [roomState, setRoomState] = useState<RoomState>({
    status: 'idle',
    timeRemaining: 0,
    participantCount: 0,
  });

  // Fetch initial room details (name, creators, settings)
  const { data: roomData, isLoading, isError } = useQuery({
    queryKey: ['study-room', roomId],
    queryFn: () => fetchStudyRoom(roomId!).then((r) => r.data.data),
    enabled: !!roomId,
  });

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !roomId || !user) return;

    // Join room
    socket.emit('community:joinStudyRoom', { roomId, userId: (user as any)?._id || (user as any)?.id });

    // Listeners
    socket.on('community:studyRoomState', (data: any) => {
      if (data.roomId === roomId) {
        setRoomState({
          status: data.status,
          timeRemaining: data.timeRemaining,
          participantCount: data.participantCount,
        });
      }
    });

    socket.on('community:timerTick', (data: any) => {
      if (data.roomId === roomId) {
        setRoomState((prev) => ({
          ...prev,
          timeRemaining: data.timeRemaining,
        }));
      }
    });

    return () => {
      socket.emit('community:leaveStudyRoom', { roomId, userId: (user as any)?._id || (user as any)?.id });
      socket.off('community:studyRoomState');
      socket.off('community:timerTick');
    };
  }, [roomId, user]);

  const handleStartTimer = () => {
    const socket = getSocket();
    if (socket && roomId && roomData) {
      // Start a focus session based on room's configured focusDuration
      socket.emit('community:startStudyTimer', { roomId, duration: roomData.focusDuration || 25 });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !roomData) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold text-destructive">Room not found</h2>
        <button onClick={() => navigate(-1)} className="mt-4 text-primary hover:underline">
          Go back
        </button>
      </div>
    );
  }

  const isFocus = roomState.status === 'focus';
  const isBreak = roomState.status === 'break';
  const isIdle = roomState.status === 'idle';

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(`/community/channel/${slug}`)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Channel
        </button>
        <div className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-full text-sm font-medium">
          <Users className="h-4 w-4 text-primary" />
          {roomState.participantCount} studying
        </div>
      </div>

      {/* Main Container */}
      <div className="rounded-3xl border border-border/50 bg-card overflow-hidden shadow-sm">
        {/* Banner area */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background p-8 border-b border-border/50">
          <h1 className="text-3xl font-black mb-2">{roomData.name}</h1>
          <p className="text-muted-foreground max-w-2xl">{roomData.description || 'Welcome to the live study room!'}</p>
        </div>

        {/* Timer UI */}
        <div className="p-8 flex flex-col items-center justify-center min-h-[400px]">
          
          {/* Status Badge */}
          <div className={cn(
            "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-8 transition-colors",
            isFocus && "bg-rose-100 text-rose-700 border border-rose-200",
            isBreak && "bg-emerald-100 text-emerald-700 border border-emerald-200",
            isIdle && "bg-muted text-muted-foreground"
          )}>
            {isFocus && <Brain className="h-4 w-4 animate-pulse" />}
            {isBreak && <Coffee className="h-4 w-4" />}
            {isIdle && <Play className="h-4 w-4" />}
            {isFocus ? 'Focus Session' : isBreak ? 'Break Time' : 'Waiting to Start'}
          </div>

          {/* Huge Timer */}
          <div className="relative group">
            {/* Glow effect behind timer */}
            <div className={cn(
              "absolute inset-0 blur-3xl opacity-20 rounded-full transition-colors duration-1000",
              isFocus ? "bg-rose-500" : isBreak ? "bg-emerald-500" : "bg-transparent"
            )} />
            
            <div className="relative text-[8rem] sm:text-[10rem] font-black tracking-tighter tabular-nums leading-none mb-8 text-foreground">
              {isIdle ? formatTime((roomData.focusDuration || 25) * 60) : formatTime(roomState.timeRemaining)}
            </div>
          </div>

          {/* Actions */}
          {isIdle ? (
            <button
              onClick={handleStartTimer}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-2xl text-lg font-bold hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/25"
            >
              <Play className="h-6 w-6" />
              Start {roomData.focusDuration || 25}-Min Focus
            </button>
          ) : (
             <div className="flex animate-in slide-in-from-bottom-4 items-center gap-2 text-muted-foreground">
               Syncing globally... stay focused!
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudyRoomNode;
