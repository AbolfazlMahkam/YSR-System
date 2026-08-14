import localStorageService from "./localStorageService";

export function uploadUrl(pathOrUrl) {
  if (typeof pathOrUrl !== "string" || !pathOrUrl.startsWith("/uploads/")) {
    return pathOrUrl;
  }
  const token = localStorageService.getToken();
  const sep = pathOrUrl.includes("?") ? "&" : "?";
  return `${pathOrUrl}${sep}token=${encodeURIComponent(token || "")}`;
}
