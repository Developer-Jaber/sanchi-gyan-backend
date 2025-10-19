export function parsePagination(query: Record<string, string | string[] | undefined>) {
  const limit = Number(query.limit ?? 20);
  const offset = Number(query.offset ?? 0);
  return { limit: Math.max(1, Math.min(100, limit)), offset: Math.max(0, offset) };
}
