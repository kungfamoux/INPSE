import React from "react";
import { Facebook, Instagram, Youtube, Twitter, Linkedin, Globe } from "lucide-react";

const PLATFORM_MAP = {
  facebook:  { icon: Facebook,  hoverColor: "#1877f2" },
  instagram: { icon: Instagram, hoverColor: "#e1306c" },
  youtube:   { icon: Youtube,   hoverColor: "#ff0000" },
  x:         { icon: Twitter,   hoverColor: "#000000" },
  twitter:   { icon: Twitter,   hoverColor: "#1da1f2" },
  linkedin:  { icon: Linkedin,  hoverColor: "#0a66c2" },
};

function getEntry(platform = "") {
  return PLATFORM_MAP[platform.toLowerCase()] || { icon: Globe, hoverColor: "#f97316" };
}

/**
 * @param {object[]} links  - array of { platform, url }
 * @param {string}   size   - tailwind icon size class, default "w-5 h-5"
 * @param {string}   baseColor - default icon color (CSS color string)
 * @param {string}   className - wrapper class
 */
export default function SocialIcons({ links = [], size = "w-5 h-5", baseColor = "#94a3b8", className = "" }) {
  if (!links || links.length === 0) return null;

  return (
    <div className={`flex items-center gap-3 flex-wrap ${className}`}>
      {links.map(({ platform, url }, i) => {
        const { icon: Icon, hoverColor } = getEntry(platform);
        return (
          <a
            key={i}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            title={platform}
            className="transition-all duration-200 hover:scale-110"
            style={{ color: baseColor }}
            onMouseEnter={(e) => (e.currentTarget.style.color = hoverColor)}
            onMouseLeave={(e) => (e.currentTarget.style.color = baseColor)}
          >
            <Icon className={size} />
          </a>
        );
      })}
    </div>
  );
}