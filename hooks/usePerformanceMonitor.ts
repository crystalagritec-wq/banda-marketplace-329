import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage?: number;
  jsHeapSize?: number;
}

export function usePerformanceMonitor(componentName: string) {
  const startTime = useRef<number>(Date.now());
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);

  useEffect(() => {
    const endTime = Date.now();
    const renderTime = endTime - startTime.current;

    let memoryInfo: any = {};
    
    if (Platform.OS === 'web') {
      try {
        // Check if performance.memory exists (Chrome only)
        const perf = performance as any;
        if (perf.memory) {
          memoryInfo = {
            memoryUsage: perf.memory.usedJSHeapSize,
            jsHeapSize: perf.memory.totalJSHeapSize,
          };
        }
      } catch (error) {
        // Silently ignore memory API errors
        console.debug('Performance memory API not available:', error);
      }
    }

    const performanceMetrics: PerformanceMetrics = {
      renderTime,
      ...memoryInfo,
    };

    setMetrics(performanceMetrics);

    // Log performance metrics in development
    if (__DEV__) {
      console.log(`[Performance] ${componentName}:`, performanceMetrics);
      
      // Warn about slow renders
      if (renderTime > 100) {
        console.warn(`[Performance] Slow render detected in ${componentName}: ${renderTime}ms`);
      }
    }
  }, [componentName]);

  return metrics;
}

export function useRenderCount(componentName: string) {
  const renderCount = useRef(0);
  
  useEffect(() => {
    renderCount.current += 1;
    
    if (__DEV__) {
      console.log(`[Render Count] ${componentName}: ${renderCount.current}`);
    }
  });

  return renderCount.current;
}

export function measureAsync<T>(name: string, asyncFn: () => Promise<T>): Promise<T> {
  const startTime = Date.now();
  
  return asyncFn().finally(() => {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    if (__DEV__) {
      console.log(`[Async Performance] ${name}: ${duration}ms`);
    }
  });
}