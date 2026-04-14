import { cn } from '@/lib/utils';

interface PageContentProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Two-column layout component inspired by Forum
 * Left column: Main content (65% on desktop)
 * Right column: Sidebar (35% on desktop)
 * Stacks vertically on mobile
 */
export const PageContent = ({ children, className }: PageContentProps) => {
  return (
    <div
      className={cn(
        'flex flex-col lg:flex-row gap-6 max-w-5xl mx-auto px-4 py-6',
        className
      )}
    >
      {children}
    </div>
  );
};

/**
 * Main content column - takes up 65% on desktop
 */
export const MainContent = ({ children, className }: PageContentProps) => {
  return (
    <div className={cn('flex-1 lg:w-[65%] min-w-0', className)}>
      {children}
    </div>
  );
};

/**
 * Sidebar column - takes up 35% on desktop
 */
export const Sidebar = ({ children, className }: PageContentProps) => {
  return (
    <div
      className={cn(
        'w-full lg:w-[35%] lg:max-w-[320px]',
        className
      )}
    >
      <div className="sticky top-20 space-y-4">
        {children}
      </div>
    </div>
  );
};

export default PageContent;
