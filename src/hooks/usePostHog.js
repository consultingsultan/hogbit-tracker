import { useCallback } from 'react';
import posthog from 'posthog-js';

export const usePostHog = () => {
  const capture = useCallback((eventName, properties = {}) => {
    try {
      if (typeof window !== 'undefined' && posthog) {
        posthog.capture(eventName, {
          ...properties,
          timestamp: new Date().toISOString(),
          app_version: '1.0.0',
          platform: 'web'
        });
      }
    } catch (error) {
      console.error('PostHog capture error:', error);
    }
  }, []);

  const identify = useCallback((userId, properties = {}) => {
    try {
      if (typeof window !== 'undefined' && posthog) {
        posthog.identify(userId, properties);
      }
    } catch (error) {
      console.error('PostHog identify error:', error);
    }
  }, []);

  return { capture, identify };
};