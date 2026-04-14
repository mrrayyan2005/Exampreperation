import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: string;
}

export const useSEO = ({
  title,
  description,
  ogTitle,
  ogDescription,
  ogImage,
  twitterCard = 'summary_large_image',
}: SEOProps) => {
  useEffect(() => {
    // Update Title
    if (title) {
      document.title = `${title} | ExamPrep`;
    }

    // Helper to update or create meta tags
    const updateMetaTag = (property: string, content: string, isName = false) => {
      const attribute = isName ? 'name' : 'property';
      let element = document.querySelector(`meta[${attribute}="${property}"]`);
      
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, property);
        document.head.appendChild(element);
      }
      
      element.setAttribute('content', content);
    };

    if (description) updateMetaTag('description', description, true);
    if (ogTitle || title) updateMetaTag('og:title', ogTitle || title || '');
    if (ogDescription || description) updateMetaTag('og:description', ogDescription || description || '');
    if (ogImage) updateMetaTag('og:image', ogImage);
    updateMetaTag('twitter:card', twitterCard, true);
    if (ogTitle || title) updateMetaTag('twitter:title', ogTitle || title || '', true);
    if (ogDescription || description) updateMetaTag('twitter:description', ogDescription || description || '', true);

  }, [title, description, ogTitle, ogDescription, ogImage, twitterCard]);
};
