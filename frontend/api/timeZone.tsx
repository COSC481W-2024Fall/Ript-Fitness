export default class TimeZone {
  /**
   * Public method to get the user's timezone.
   * The timezone is returned in the format:
   * - "America/New_York"
   * - "GMT"
   * - "Europe/London"
   */
  public static get(): string {
    // Use the Intl API to get the time zone
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Fallback to GMT if no time zone is detected
    return timeZone || "GMT";
  }
}
