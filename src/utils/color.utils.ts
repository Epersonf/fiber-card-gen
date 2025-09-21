export class ColorUtils {
  /**
   * Ensure hex color has leading '#', return fallback if empty
   */
  public static normalizeHex(h: string, fallback = '#000000') {
    if (!h) return fallback;
    return h[0] === '#' ? h : `#${h}`;
  }
}
