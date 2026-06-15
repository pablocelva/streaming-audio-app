import { Stack as ExpoStack, Tabs as ExpoTabs } from "expo-router";

/**
 * expo-router typings resolve @types/react@19 from web apps in this monorepo.
 * Mobile runs React 18 — loosen types here so layouts typecheck cleanly.
 */
export const Stack = ExpoStack as any;
export const Tabs = ExpoTabs as any;
