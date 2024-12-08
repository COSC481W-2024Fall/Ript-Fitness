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
  public static convertToTimeZone(gmtTime: string, timeZone: string): string {
    console.log(gmtTime);
  
    // If the input is like "2024-12-07T20:39:41.09189"
    // we need to make it ISO 8601 friendly: truncate to 3 decimal places and add 'Z'
    let isoString = gmtTime;
  
    // Find the decimal part for seconds
    const dotIndex = isoString.indexOf('.');
    if (dotIndex !== -1) {
      // Keep only 3 decimals (e.g. 091 from 09189)
      isoString = isoString.substring(0, dotIndex + 4);
    }
    
    // Ensure it ends with Z to indicate UTC
    if (!isoString.endsWith('Z')) {
      isoString += 'Z';
    }
  
    // Use a valid IANA time zone. If none provided, default to America/New_York
    if (!timeZone) {
      timeZone = "America/New_York";
    }
  
    const date = new Date(isoString);
  
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timeZone,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true, // converts to 12 hour format
    });

    return formatter.format(date);
  }
}
