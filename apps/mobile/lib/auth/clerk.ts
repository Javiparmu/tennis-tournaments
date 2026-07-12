// Single swap-point for the Clerk binding. The mobile query hooks import
// useAuth/useUser from here so they mirror the web hooks (which import the same
// shape from @clerk/nextjs) — only this file differs between platforms.
export { useAuth, useUser } from "@clerk/clerk-expo";
