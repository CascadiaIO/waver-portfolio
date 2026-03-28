import React from "react";

interface SiteHeaderProps {
  name: string;
  children?: React.ReactNode;
}

export const SiteHeader: React.FC<SiteHeaderProps> = ({ name, children }) => (
  <header className="w-full flex flex-col items-center justify-center py-8">
    <h1 className="text-4xl font-bold text-center">{name}</h1>
    {children}
  </header>
);

export default SiteHeader;
