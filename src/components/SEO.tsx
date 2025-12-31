// src/components/SEO.tsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

type Props = {
  title: string;
  description?: string;
  canonical?: string;
  image?: string;
  noIndex?: boolean;
  schema?: Record<string, unknown> | Array<Record<string, unknown>>;
};

const SITE_NAME = "Insomnia Fuel";
const DEFAULT_DESCRIPTION =
  "Late-night cafe in Parramatta serving smash burgers, specialty coffee, and comfort food.";
const DEFAULT_IMAGE = "/logo.png";
const DEFAULT_LOCALE = "en_AU";

const toAbsoluteUrl = (url: string, origin: string) => {
  if (!url) return url;
  if (/^https?:\/\//i.test(url)) return url;
  if (!origin) return url;
  const prefix = url.startsWith("/") ? "" : "/";
  return `${origin}${prefix}${url}`;
};

export default function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  canonical,
  image = DEFAULT_IMAGE,
  noIndex = false,
  schema,
}: Props) {
  const location = useLocation();

  useEffect(() => {
    const hasSiteName = title.toLowerCase().includes(SITE_NAME.toLowerCase());
    const fullTitle = hasSiteName ? title : `${title} | ${SITE_NAME}`;
    document.title = fullTitle;

    const origin = window.location.origin;
    const resolvedCanonical = canonical || `${origin}${location.pathname}`;
    const resolvedImage = toAbsoluteUrl(image, origin);

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

    const ensureScript = (id: string, data: unknown) => {
      let script = document.getElementById(id) as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement("script");
        script.type = "application/ld+json";
        script.id = id;
        document.head.appendChild(script);
      }
      script.text = JSON.stringify(data);
    };

    ensureMeta("meta[name='description']", { name: "description", content: description });
    ensureMeta("meta[name='robots']", {
      name: "robots",
      content: noIndex ? "noindex,nofollow" : "index,follow",
    });
    ensureMeta("meta[property='og:title']", { property: "og:title", content: fullTitle });
    ensureMeta("meta[property='og:description']", { property: "og:description", content: description });
    ensureMeta("meta[property='og:image']", { property: "og:image", content: resolvedImage });
    ensureMeta("meta[property='og:type']", { property: "og:type", content: "website" });
    ensureMeta("meta[property='og:site_name']", { property: "og:site_name", content: SITE_NAME });
    ensureMeta("meta[property='og:locale']", { property: "og:locale", content: DEFAULT_LOCALE });
    ensureMeta("meta[property='og:url']", { property: "og:url", content: resolvedCanonical });
    ensureMeta("meta[name='twitter:card']", { name: "twitter:card", content: "summary_large_image" });
    ensureMeta("meta[name='twitter:title']", { name: "twitter:title", content: fullTitle });
    ensureMeta("meta[name='twitter:description']", { name: "twitter:description", content: description });
    ensureMeta("meta[name='twitter:image']", { name: "twitter:image", content: resolvedImage });
    ensureLink("canonical", resolvedCanonical);

    const webPageSchema = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: fullTitle,
      description,
      url: resolvedCanonical,
      inLanguage: "en-AU",
    };

    const schemaPayload = Array.isArray(schema)
      ? [webPageSchema, ...schema]
      : schema
      ? [webPageSchema, schema]
      : [webPageSchema];

    ensureScript("schema-org", schemaPayload);
  }, [title, description, canonical, image, noIndex, schema, location.pathname]);

  return null;
}
