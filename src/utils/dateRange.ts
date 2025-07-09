export function getStartDateFromRange(range: string): Date {
  const now = new Date();
  const lower = range.toLowerCase();

  switch (lower) {
    case "7d":
      return new Date(now.setDate(now.getDate() - 7));
    case "30d":
      return new Date(now.setDate(now.getDate() - 30));
    case "90d":
      return new Date(now.setDate(now.getDate() - 90));
    case "ytd":
      return new Date(new Date().getFullYear(), 0, 1);
    case "all":
    default:
      return new Date("2000-01-01"); // fallback
  }
}
