import React from "react";

interface SiteDescriptionProps {
  children: React.ReactNode;
}

export const SiteDescription: React.FC<SiteDescriptionProps> = ({
  children,
}) => (
  <div className="w-full flex flex-col items-center justify-center pb-8">
    <p className="text-lg text-center text-gray-300 max-w-2xl">{children}</p>
  </div>
);

export default SiteDescription;
