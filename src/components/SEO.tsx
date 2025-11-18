// src/components/SEO.tsx
import { useEffect } from "react";

type Props = {
  title: string;
  description?: string;
  canonical?: string;
  image?: string;
};

export default function SEO({
  title,
  description = "Insomnia Fuel.",
  canonical,
  image = "/assets/og/og-default.jpg",
}: Props) {
  useEffect(() => {
    const fullTitle = `${title} | Insomnia Fuel`;
    document.title = fullTitle;

    const ensureMeta = (selector: string, attrs: Record<string, string>) => {
      let el = document.head.querySelector(selector) as HTMLElement | null;
      if (!el) {
        el = document.createElement("meta");
        Object.entries(attrs).forEach(([k, v]) => el!.setAttribute(k, v));
        document.head.appendChild(el);
      } else {
        Object.entries(attrs).forEach(([k, v]) => el!.setAttribute(k, v));
      }
    };

    const ensureLink = (rel: string, href: string) => {
      let link = document.head.querySelector(`link[rel='${rel}']`) as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement("link");
        link.rel = rel;
        document.head.appendChild(link);
      }
      link.href = href;
    };

    ensureMeta("meta[name='description']", { name: "description", content: description });
    ensureMeta("meta[property='og:title']", { property: "og:title", content: fullTitle });
    ensureMeta("meta[property='og:description']", { property: "og:description", content: description });
    ensureMeta("meta[property='og:image']", { property: "og:image", content: image });
    ensureMeta("meta[property='og:type']", { property: "og:type", content: "website" });
    ensureMeta("meta[name='twitter:card']", { name: "twitter:card", content: "summary_large_image" });
    ensureMeta("meta[name='twitter:title']", { name: "twitter:title", content: fullTitle });
    ensureMeta("meta[name='twitter:description']", { name: "twitter:description", content: description });
    ensureMeta("meta[name='twitter:image']", { name: "twitter:image", content: image });
    if (canonical) ensureLink("canonical", canonical);
  }, [title, description, canonical, image]);

  return null;
}
