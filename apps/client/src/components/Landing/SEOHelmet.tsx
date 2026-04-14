import React, { useEffect } from 'react';

interface SEOProps {
    title?: string;
    description?: string;
    keywords?: string;
    image?: string;
    url?: string;
}

const SEOHelmet: React.FC<SEOProps> = ({
    title = 'ExamPrep - AI-Powered Study Planning & Exam Success Platform',
    description = 'Transform your exam preparation with AI-powered study plans, adaptive scheduling, progress analytics, and spaced repetition. Join 50,000+ students achieving better results with less stress.',
    keywords = 'exam preparation, study planner, AI study assistant, spaced repetition, exam success, study schedule, progress tracking, mock tests',
    image = 'https://examprep.com/og-image.jpg',
    url = 'https://examprep.com'
}) => {
    useEffect(() => {
        // Set document title
        document.title = title;

        // Function to update or create meta tag
        const updateMetaTag = (property: string, content: string, isProperty = false) => {
            const attribute = isProperty ? 'property' : 'name';
            let element = document.querySelector(`meta[${attribute}="${property}"]`);
            
            if (!element) {
                element = document.createElement('meta');
                element.setAttribute(attribute, property);
                document.head.appendChild(element);
            }
            
            element.setAttribute('content', content);
        };

        // Primary Meta Tags
        updateMetaTag('description', description);
        updateMetaTag('keywords', keywords);

        // Open Graph / Facebook
        updateMetaTag('og:type', 'website', true);
        updateMetaTag('og:url', url, true);
        updateMetaTag('og:title', title, true);
        updateMetaTag('og:description', description, true);
        updateMetaTag('og:image', image, true);

        // Twitter
        updateMetaTag('twitter:card', 'summary_large_image', true);
        updateMetaTag('twitter:url', url, true);
        updateMetaTag('twitter:title', title, true);
        updateMetaTag('twitter:description', description, true);
        updateMetaTag('twitter:image', image, true);

        // Additional SEO
        updateMetaTag('robots', 'index, follow');
        updateMetaTag('language', 'English');
        updateMetaTag('author', 'ExamPrep');

        // Add structured data
        const scriptId = 'structured-data';
        let script = document.getElementById(scriptId) as HTMLScriptElement;
        
        if (!script) {
            script = document.createElement('script');
            script.id = scriptId;
            script.type = 'application/ld+json';
            document.head.appendChild(script);
        }

        const structuredData = {
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'ExamPrep',
            applicationCategory: 'EducationalApplication',
            description: description,
            offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD'
            },
            aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '4.8',
                ratingCount: '5000'
            },
            operatingSystem: 'Web',
            author: {
                '@type': 'Organization',
                name: 'ExamPrep'
            }
        };

        script.textContent = JSON.stringify(structuredData);

        // Set canonical URL
        let link = document.querySelector('link[rel="canonical"]');
        if (!link) {
            link = document.createElement('link');
            link.setAttribute('rel', 'canonical');
            document.head.appendChild(link);
        }
        link.setAttribute('href', url);

    }, [title, description, keywords, image, url]);

    return null;
};

export default SEOHelmet;
