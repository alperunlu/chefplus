import { Platform } from 'react-native';

/**
 * Copy text to the clipboard. The web clipboard API needs a secure context and
 * a user gesture, so it falls back to a hidden textarea + execCommand. On
 * native, the Share sheet handles "copy" too, so callers usually fall back to
 * Share there instead.
 */
export async function copyText(text: string): Promise<boolean> {
  if (Platform.OS === 'web') {
    const nav = globalThis.navigator as (Navigator & { clipboard?: { writeText: (t: string) => Promise<void> } }) | undefined;
    if (nav?.clipboard?.writeText) {
      try {
        await nav.clipboard.writeText(text);
        return true;
      } catch {
        // fall through to the textarea path
      }
    }
    try {
      const el = document.createElement('textarea');
      el.value = text;
      el.setAttribute('readonly', '');
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(el);
      return ok;
    } catch {
      return false;
    }
  }
  return false;
}
