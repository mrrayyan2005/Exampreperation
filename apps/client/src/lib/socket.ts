import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const initializeSocket = (token: string): Socket => {
  if (socket?.connected) {
    return socket;
  }

  const SOCKET_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/api$/, '');

  socket = io(SOCKET_URL, {
    auth: {
      token
    },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5
  });

  socket.on('connect', () => {});

  socket.on('disconnect', (reason) => {});

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error.message);
  });

  return socket;
};

export const getSocket = (): Socket | null => {
  return socket;
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const joinStudyRoom = (roomId: string): void => {
  socket?.emit('join-study-room', { roomId });
};

export const leaveStudyRoom = (roomId: string): void => {
  socket?.emit('leave-study-room', { roomId });
};

export const updatePresence = (roomId: string, status: 'online' | 'studying' | 'idle'): void => {
  socket?.emit('update-presence', { roomId, status });
};

export const sendMessage = (roomId: string, message: string): void => {
  socket?.emit('send-message', { roomId, message });
};

export const emitPomodoroPhaseChange = (
  roomId: string,
  phase: 'work' | 'short-break' | 'long-break',
  startTime: Date,
  endTime: Date
): void => {
  socket?.emit('pomodoro-phase-change', { roomId, phase, startTime, endTime });
};

export const emitSessionStarted = (roomId: string, startTime: Date): void => {
  socket?.emit('session-started', { roomId, startTime });
};

export const emitSessionEnded = (roomId: string, endTime: Date, stats: any): void => {
  socket?.emit('session-ended', { roomId, endTime, stats });
};

export const onParticipantJoined = (callback: (data: any) => void): void => {
  socket?.on('participant-joined', callback);
};

export const onParticipantLeft = (callback: (data: any) => void): void => {
  socket?.on('participant-left', callback);
};

export const onPresenceUpdated = (callback: (data: any) => void): void => {
  socket?.on('presence-updated', callback);
};

export const onPomodoroUpdated = (callback: (data: any) => void): void => {
  socket?.on('pomodoro-updated', callback);
};

export const onSessionStartNotification = (callback: (data: any) => void): void => {
  socket?.on('session-start-notification', callback);
};

export const onSessionEndNotification = (callback: (data: any) => void): void => {
  socket?.on('session-end-notification', callback);
};

export const onNewMessage = (callback: (data: any) => void): void => {
  socket?.on('new-message', callback);
};

export const onNewNotification = (callback: (data: any) => void): void => {
  socket?.on('new-notification', callback);
};

export const offParticipantJoined = (callback?: (data: any) => void): void => {
  socket?.off('participant-joined', callback);
};

export const offParticipantLeft = (callback?: (data: any) => void): void => {
  socket?.off('participant-left', callback);
};

export const offPresenceUpdated = (callback?: (data: any) => void): void => {
  socket?.off('presence-updated', callback);
};

export const offPomodoroUpdated = (callback?: (data: any) => void): void => {
  socket?.off('pomodoro-updated', callback);
};

export const offSessionStartNotification = (callback?: (data: any) => void): void => {
  socket?.off('session-start-notification', callback);
};

export const offSessionEndNotification = (callback?: (data: any) => void): void => {
  socket?.off('session-end-notification', callback);
};

export const offNewMessage = (callback?: (data: any) => void): void => {
  socket?.off('new-message', callback);
};

export const offNewNotification = (): void => {
  socket?.off('new-notification');
};