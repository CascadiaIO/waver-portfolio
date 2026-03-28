import type { IconType } from "react-icons";
import {
  FaCloud,
  FaCoffee,
  FaEgg,
  FaEnvelope,
  FaGithub,
  FaInstagram,
  FaItchIo,
  FaPatreon,
  FaTwitter,
  FaYoutube,
} from "react-icons/fa";

export interface HomeLink {
  name: string;
  icon: IconType;
  link: string;
}

export const homeLinks: HomeLink[] = [
  {
    name: "YouTube",
    icon: FaYoutube,
    link: "https://www.youtube.com/@yourchannel",
  },
  {
    name: "Twitter",
    icon: FaTwitter,
    link: "https://twitter.com/yourhandle",
  },
  {
    name: "Instagram",
    icon: FaInstagram,
    link: "https://www.instagram.com/yourhandle/",
  },
  {
    name: "itch.io",
    icon: FaItchIo,
    link: "https://yourhandle.itch.io/",
  },
  {
    name: "BlueSky",
    icon: FaCloud,
    link: "https://bsky.app/profile/yourhandle",
  },
  {
    name: "Cohost",
    icon: FaEgg,
    link: "https://cohost.org/yourhandle",
  },
  {
    name: "Ko-Fi",
    icon: FaCoffee,
    link: "https://ko-fi.com/yourhandle",
  },
  {
    name: "Patreon",
    icon: FaPatreon,
    link: "https://www.patreon.com/yourhandle",
  },
  {
    name: "GitHub",
    icon: FaGithub,
    link: "https://github.com/yourhandle/",
  },
  {
    name: "Email",
    icon: FaEnvelope,
    link: "mailto:you@example.com",
  },
];
