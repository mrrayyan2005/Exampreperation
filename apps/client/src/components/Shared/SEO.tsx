import React from 'react';
import { useSEO } from '@/hooks/useSEO';

interface SEOComponentProps {
  title?: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: string;
  children?: React.ReactNode;
}

export const SEO: React.FC<SEOComponentProps> = ({ children, ...props }) => {
  useSEO(props);
  return <>{children}</>;
};
