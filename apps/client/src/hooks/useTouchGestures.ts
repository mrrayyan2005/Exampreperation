/**
 * Touch Gesture Hooks
 * 
 * Mobile-optimized touch gestures for better UX
 */

import { useState, useRef, useCallback, useEffect } from 'react';

interface TouchPosition {
  x: number;
  y: number;
}

interface SwipeData {
  direction: 'left' | 'right' | 'up' | 'down';
  distance: number;
  velocity: number;
}

interface UseSwipeOptions {
  threshold?: number;
  velocityThreshold?: number;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onSwipe?: (data: SwipeData) => void;
}

export function useSwipe(options: UseSwipeOptions = {}) {
  const {
    threshold = 50,
    velocityThreshold = 0.5,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onSwipe,
  } = options;

  const [isSwiping, setIsSwiping] = useState(false);
  const startPos = useRef<TouchPosition | null>(null);
  const startTime = useRef<number>(0);
  const currentPos = useRef<TouchPosition | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    startPos.current = { x: touch.clientX, y: touch.clientY };
    currentPos.current = { x: touch.clientX, y: touch.clientY };
    startTime.current = Date.now();
    setIsSwiping(true);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isSwiping) return;
    const touch = e.touches[0];
    currentPos.current = { x: touch.clientX, y: touch.clientY };
  }, [isSwiping]);

  const handleTouchEnd = useCallback(() => {
    if (!isSwiping || !startPos.current || !currentPos.current) {
      setIsSwiping(false);
      return;
    }

    const deltaX = currentPos.current.x - startPos.current.x;
    const deltaY = currentPos.current.y - startPos.current.y;
    const deltaTime = Date.now() - startTime.current;

    const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);
    const velocity = distance / deltaTime;

    if (distance < threshold || velocity < velocityThreshold) {
      setIsSwiping(false);
      return;
    }

    let direction: SwipeData['direction'];
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      direction = deltaX > 0 ? 'right' : 'left';
    } else {
      direction = deltaY > 0 ? 'down' : 'up';
    }

    const swipeData: SwipeData = { direction, distance, velocity };

    onSwipe?.(swipeData);

    switch (direction) {
      case 'left':
        onSwipeLeft?.();
        break;
      case 'right':
        onSwipeRight?.();
        break;
      case 'up':
        onSwipeUp?.();
        break;
      case 'down':
        onSwipeDown?.();
        break;
    }

    setIsSwiping(false);
    startPos.current = null;
    currentPos.current = null;
  }, [isSwiping, threshold, velocityThreshold, onSwipe, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]);

  return {
    isSwiping,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  };
}

interface UsePinchOptions {
  onPinchStart?: () => void;
  onPinchMove?: (scale: number) => void;
  onPinchEnd?: (scale: number) => void;
  minScale?: number;
  maxScale?: number;
}

export function usePinch(options: UsePinchOptions = {}) {
  const { onPinchStart, onPinchMove, onPinchEnd, minScale = 0.5, maxScale = 3 } = options;
  
  const [scale, setScale] = useState(1);
  const [isPinching, setIsPinching] = useState(false);
  const startDistance = useRef<number>(0);
  const startScale = useRef<number>(1);

  const getDistance = (touches: React.TouchList): number => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length !== 2) return;
    
    startDistance.current = getDistance(e.touches);
    startScale.current = scale;
    setIsPinching(true);
    onPinchStart?.();
  }, [scale, onPinchStart]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPinching || e.touches.length !== 2) return;
    
    const distance = getDistance(e.touches);
    const newScale = Math.min(
      maxScale,
      Math.max(minScale, startScale.current * (distance / startDistance.current))
    );
    
    setScale(newScale);
    onPinchMove?.(newScale);
  }, [isPinching, minScale, maxScale, onPinchMove]);

  const handleTouchEnd = useCallback(() => {
    if (!isPinching) return;
    
    setIsPinching(false);
    onPinchEnd?.(scale);
  }, [isPinching, scale, onPinchEnd]);

  return {
    scale,
    isPinching,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  };
}

interface UseLongPressOptions {
  threshold?: number;
  onLongPress: () => void;
  onCancel?: () => void;
}

export function useLongPress(options: UseLongPressOptions) {
  const { threshold = 500, onLongPress, onCancel } = options;
  
  const [isPressed, setIsPressed] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const didLongPress = useRef(false);

  const start = useCallback(() => {
    didLongPress.current = false;
    setIsPressed(true);
    
    timerRef.current = setTimeout(() => {
      didLongPress.current = true;
      onLongPress();
    }, threshold);
  }, [threshold, onLongPress]);

  const end = useCallback(() => {
    setIsPressed(false);
    
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    
    if (!didLongPress.current) {
      onCancel?.();
    }
  }, [onCancel]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return {
    isPressed,
    handlers: {
      onMouseDown: start,
      onMouseUp: end,
      onMouseLeave: end,
      onTouchStart: start,
      onTouchEnd: end,
    },
  };
}

export function useDoubleTap(onDoubleTap: () => void, delay = 300) {
  const lastTap = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleTap = useCallback(() => {
    const now = Date.now();
    const timeSince = now - lastTap.current;

    if (timeSince < delay && timeSince > 0) {
      onDoubleTap();
      lastTap.current = 0;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    } else {
      lastTap.current = now;
      timerRef.current = setTimeout(() => {
        lastTap.current = 0;
      }, delay);
    }
  }, [delay, onDoubleTap]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return handleTap;
}