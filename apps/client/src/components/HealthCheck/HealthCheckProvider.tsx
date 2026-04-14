/**
    * Health Check Provider
    * 
    * Monitors application health and provides status indicators
    */
   
   import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
   
   interface HealthStatus {
     status: 'healthy' | 'degraded' | 'unhealthy';
     checks: {
       api: boolean;
       websocket: boolean;
       storage: boolean;
       network: boolean;
     };
     lastChecked: Date;
     latency: number;
   }
   
   interface HealthCheckContextType {
     health: HealthStatus;
     isHealthy: boolean;
     checkHealth: () => Promise<void>;
     retryCount: number;
   }
   
   const HealthCheckContext = createContext<HealthCheckContextType | undefined>(undefined);
   
   const API_HEALTH_ENDPOINT = '/health';
   const HEALTH_CHECK_INTERVAL = 30000; // 30 seconds
   
   export function HealthCheckProvider({ children }: { children: React.ReactNode }) {
     const [health, setHealth] = useState<HealthStatus>({
       status: 'healthy',
       checks: {
         api: true,
         websocket: true,
         storage: true,
         network: true,
       },
       lastChecked: new Date(),
       latency: 0,
     });
     const [retryCount, setRetryCount] = useState(0);
   
     const checkStorage = useCallback((): boolean => {
       try {
         localStorage.setItem('__health_check__', 'test');
         localStorage.removeItem('__health_check__');
         return true;
       } catch {
         return false;
       }
     }, []);
   
     const checkNetwork = useCallback((): boolean => {
       return navigator.onLine;
     }, []);
   
     const checkWebSocket = useCallback((): boolean => {
       return 'WebSocket' in window;
     }, []);
   
     const checkAPI = useCallback(async (): Promise<{ healthy: boolean; latency: number }> => {
       const startTime = performance.now();
       try {
         const controller = new AbortController();
         const timeoutId = setTimeout(() => controller.abort(), 5000);
   
         const response = await fetch(API_HEALTH_ENDPOINT, {
           method: 'HEAD',
           signal: controller.signal,
         });
   
         clearTimeout(timeoutId);
         const latency = Math.round(performance.now() - startTime);
   
         return { healthy: response.ok, latency };
       } catch {
         return { healthy: false, latency: 0 };
       }
     }, []);
   
     const checkHealth = useCallback(async () => {
       const network = checkNetwork();
       const storage = checkStorage();
       const websocket = checkWebSocket();
       
       let api = false;
       let latency = 0;
   
       if (network) {
         const apiCheck = await checkAPI();
         api = apiCheck.healthy;
         latency = apiCheck.latency;
       }
   
       const allHealthy = network && storage && websocket && api;
       const someHealthy = network && (api || storage);
   
       const status: HealthStatus['status'] = allHealthy 
         ? 'healthy' 
         : someHealthy 
         ? 'degraded' 
         : 'unhealthy';
   
       setHealth({
         status,
         checks: { api, websocket, storage, network },
         lastChecked: new Date(),
         latency,
       });
   
       if (!allHealthy) {
         setRetryCount(prev => prev + 1);
       } else {
         setRetryCount(0);
       }
   
       window.dispatchEvent(new CustomEvent('app:healthchange', { 
         detail: { status, checks: { api, websocket, storage, network } }
       }));
     }, [checkNetwork, checkStorage, checkWebSocket, checkAPI]);
   
     useEffect(() => {
       const timeoutId = setTimeout(() => {
         checkHealth();
       }, 100);
   
       const intervalId = setInterval(checkHealth, HEALTH_CHECK_INTERVAL);
       
       const handleOnline = () => checkHealth();
       const handleOffline = () => {
         setHealth(prev => ({
           ...prev,
           status: 'degraded',
           checks: { ...prev.checks, network: false },
           lastChecked: new Date(),
         }));
       };
   
       window.addEventListener('online', handleOnline);
       window.addEventListener('offline', handleOffline);
   
       return () => {
         clearTimeout(timeoutId);
         clearInterval(intervalId);
         window.removeEventListener('online', handleOnline);
         window.removeEventListener('offline', handleOffline);
       };
     }, [checkHealth]);
   
     const isHealthy = health.status === 'healthy';
   
     return (
       <HealthCheckContext.Provider value={{ health, isHealthy, checkHealth, retryCount }}>
         {children}
       </HealthCheckContext.Provider>
     );
   }
   
   export function useHealthCheck() {
     const context = useContext(HealthCheckContext);
     if (!context) {
       throw new Error('useHealthCheck must be used within HealthCheckProvider');
     }
     return context;
   }
   
   export function useHealthStatus() {
     const { health } = useHealthCheck();
     return health.status;
   }