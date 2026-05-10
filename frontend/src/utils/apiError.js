export function getApiErrorMessage(error, fallback = "Something went sideways. Try again.") {
  const detail = error?.response?.data?.detail;

  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((item) => item?.msg || item?.message || String(item))
      .filter(Boolean)
      .join(" ");
  }
  if (detail && typeof detail === "object") {
    return detail.msg || detail.message || fallback;
  }

  return error?.message || fallback;
}
