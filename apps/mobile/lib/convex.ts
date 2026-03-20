import { ConvexReactClient } from "convex/react";

// Set EXPO_PUBLIC_CONVEX_URL in your .env or app.config.js
const CONVEX_URL = process.env.EXPO_PUBLIC_CONVEX_URL ?? "https://placeholder.convex.cloud";

export const convex = new ConvexReactClient(CONVEX_URL);
