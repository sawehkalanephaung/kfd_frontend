import React from 'react';

interface SidebarToggleIconProps extends React.SVGProps<SVGSVGElement> {
  isCollapsed?: boolean;
  className?: string;
}

/**
 * Modern Sidebar Expand/Collapse Toggle Icon
 * Matches the squircle panel design with directional chevron indicator.
 */
export function SidebarToggleIcon({
  isCollapsed = false,
  className = 'w-5 h-5',
  ...props
}: SidebarToggleIconProps) {
  // When collapsed, we horizontally mirror the icon. 
  // This smoothly moves the sidebar divider to the right and flips the chevron to point right (>).
  const combinedClassName = `${className} transition-transform duration-300 ${isCollapsed ? '-scale-x-100' : ''}`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={combinedClassName}
      aria-hidden="true"
      {...props}
    >
      {/* Outer Squircle Container matching reference */}
      <rect width="18" height="18" x="3" y="3" rx="4.5" ry="4.5" />
      {/* Left Sidebar Divider Line */}
      <line x1="9" y1="3" x2="9" y2="21" />
      {/* Directional Chevron Indicator (points left < by default) */}
      <path d="m15 9-3 3 3 3" />
    </svg>
  );
}

export default SidebarToggleIcon;
