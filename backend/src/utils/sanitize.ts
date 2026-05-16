import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize user input strings before storing in database.
 * Removes all HTML tags and dangerous characters.
 */
export function sanitizeInput(dirty: string | null | undefined): string {
  if (!dirty) return '';
  // First pass: remove all HTML
  let clean = DOMPurify.sanitize(dirty, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
  // Second pass: trim and limit length
  clean = clean.trim().slice(0, 5000);
  return clean;
}

/**
 * Sanitize HTML content that is allowed to contain some formatting.
 * Only allows safe tags.
 */
export function sanitizeHtml(dirty: string | null | undefined): string {
  if (!dirty) return '';
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'u', 'br', 'p', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: [],
  });
}

/**
 * Middleware: sanitize all string fields in req.body
 */
export function sanitizeBody(req: any, _res: any, next: any): void {
  if (typeof req.body === 'object' && req.body !== null) {
    for (const key of Object.keys(req.body)) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeInput(req.body[key]);
      }
    }
  }
  next();
}
