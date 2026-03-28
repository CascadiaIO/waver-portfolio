import React from "react";
import Link from "next/link";
import { homeLinks } from "@/lib/data/homeLinks";

export default function HomeLinksSection() {
  return (
    <section className="w-full max-w-4xl mx-auto mt-16 mb-8">
      <h2 className="text-2xl font-semibold text-center mb-6 tracking-wide">
        Links
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 justify-items-center">
        {homeLinks.map(({ name, icon: Icon, link }) => (
          <Link
            key={name}
            href={link}
            target={link.startsWith("http") ? "_blank" : undefined}
            rel={link.startsWith("http") ? "noopener noreferrer" : undefined}
            className="flex flex-col items-center group transition-colors">
            <span className="text-3xl mb-1 group-hover:text-blue-500 transition-colors">
              <Icon />
            </span>
            <span className="text-sm opacity-80 group-hover:opacity-100 text-center group-hover:text-blue-500 transition-colors">
              {name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
