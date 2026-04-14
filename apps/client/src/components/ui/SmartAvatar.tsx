import * as React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "./avatar";
import { getBestAvatarUrl, getInitials, getAvatarColor } from "@/lib/avatar";
import { cn } from "@/lib/utils";

interface SmartAvatarProps {
  src?: string;
  alt?: string;
  email?: string;
  name?: string;
  className?: string;
  fallbackClassName?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-16 w-16",
  xl: "h-32 w-32",
};

const textSizes = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-lg",
  xl: "text-3xl",
};

/**
 * Smart Avatar component with automatic fallback chain:
 * 1. Custom profile picture
 * 2. Gravatar (based on email)
 * 3. Initials with colored background
 */
export const SmartAvatar = React.forwardRef<
  React.ElementRef<typeof Avatar>,
  SmartAvatarProps
>(({ src, alt, email, name, className, fallbackClassName, size = "md" }, ref) => {
  const [hasError, setHasError] = React.useState(false);

  // Get the best avatar URL with fallback logic
  const avatarData = React.useMemo(() => {
    return getBestAvatarUrl(src, email, name);
  }, [src, email, name]);

  // If the primary source failed, try Gravatar
  const displayUrl = hasError && avatarData.fallback === 'image' && email
    ? getBestAvatarUrl(undefined, email, name).url
    : avatarData.url;

  // If Gravatar also fails, show initials
  const showInitials = !displayUrl || (hasError && avatarData.fallback !== 'image');
  const initials = getInitials(name || alt);
  const bgColor = getAvatarColor(name || alt);

  const handleError = () => {
    setHasError(true);
  };

  return (
    <Avatar ref={ref} className={cn(sizeClasses[size], className)}>
      {!showInitials && (
        <AvatarImage
          src={displayUrl}
          alt={name || alt || 'User'}
          onError={handleError}
        />
      )}
      <AvatarFallback
        className={cn(
          bgColor,
          "text-white font-semibold",
          textSizes[size],
          fallbackClassName
        )}
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  );
});

SmartAvatar.displayName = "SmartAvatar";

export default SmartAvatar;
