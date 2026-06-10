import { getFinScanProfileAvatar } from "@ace-ds/lib/finscanProfileAvatars";
import { publicAsset } from "./publicAsset";
import type { UserFlowId } from "../flows/flowTypes";

/** ACE site header profiles — files under `public/brand/profiles/` */
export const JANET_PROFILE_IMAGE_PATH = "/brand/profiles/janet.png";
export const LAURA_PROFILE_IMAGE_PATH = "/brand/profiles/laura.png";

export const janetProfileImageUrl = publicAsset(JANET_PROFILE_IMAGE_PATH);
export const lauraProfileImageUrl = publicAsset(LAURA_PROFILE_IMAGE_PATH);

/** Level 1 → Janet; Level 2 → Laura */
export function getProfileForUserFlow(flowId: UserFlowId) {
  switch (flowId) {
    case "level-2":
      return getFinScanProfileAvatar("laura");
    case "level-1":
    default:
      return getFinScanProfileAvatar("janet");
  }
}
