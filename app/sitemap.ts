import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://commitmap.ashutoshswamy.in";
  
  const routes = [
    "",
    "/dashboard",
    "/branches",
    "/diff",
    "/files",
    "/remotes",
    "/stashes",
    "/timeline",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1.0 : 0.8,
  }));
}
