import sanitizeHtml from 'sanitize-html';

/**
 * Sanitization options for lesson HTML content
 * Allows safe HTML tags while removing dangerous content
 */
const sanitizeOptions = {
  allowedTags: [
    'p', 'br', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'strong', 'em', 'u', 's',
    'a', 'img', 'code', 'pre', 'blockquote',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'div', 'span'
  ],
  allowedAttributes: {
    'a': ['href', 'target', 'rel'],
    'img': ['src', 'alt', 'width', 'height'],
    'code': ['class'],
    'pre': ['class'],
    'div': ['class'],
    'span': ['class']
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  allowedSchemesByTag: {
    img: ['http', 'https', 'data']
  },
  // Transform links to add security attributes
  transformTags: {
    'a': (tagName, attribs) => {
      return {
        tagName: 'a',
        attribs: {
          ...attribs,
          rel: 'noopener noreferrer',
          target: '_blank'
        }
      };
    }
  },
  // Disallow all classes except code-related ones
  allowedClasses: {
    'code': ['language-*', 'hljs', 'hljs-*'],
    'pre': ['language-*', 'hljs'],
    'div': ['code-block'],
    'span': ['hljs-*']
  }
};

/**
 * Sanitize HTML content for lessons
 * Removes dangerous content while preserving safe formatting
 * @param {string} htmlContent - The HTML content to sanitize
 * @returns {string} - Sanitized HTML content
 */
export const sanitizeLessonContent = (htmlContent) => {
  if (!htmlContent || typeof htmlContent !== 'string') {
    return '';
  }

  // Sanitize the HTML
  const sanitized = sanitizeHtml(htmlContent, sanitizeOptions);

  return sanitized;
};

/**
 * Check if HTML content contains dangerous elements
 * @param {string} htmlContent - The HTML content to check
 * @returns {boolean} - True if dangerous content is detected
 */
export const containsDangerousContent = (htmlContent) => {
  if (!htmlContent) return false;

  // Check for script tags
  if (/<script[\s\S]*?>[\s\S]*?<\/script>/gi.test(htmlContent)) {
    return true;
  }

  // Check for event handlers
  if (/on\w+\s*=/gi.test(htmlContent)) {
    return true;
  }

  // Check for javascript: protocol
  if (/javascript:/gi.test(htmlContent)) {
    return true;
  }

  // Check for data: protocol (except in img tags)
  if (/href\s*=\s*["']data:/gi.test(htmlContent)) {
    return true;
  }

  return false;
};

/**
 * Validate that HTML content is safe
 * @param {string} htmlContent - The HTML content to validate
 * @returns {Object} - Validation result with isValid and errors
 */
export const validateHtmlContent = (htmlContent) => {
  const errors = [];

  if (!htmlContent) {
    return { isValid: true, errors: [] };
  }

  if (typeof htmlContent !== 'string') {
    errors.push('Content must be a string');
    return { isValid: false, errors };
  }

  if (containsDangerousContent(htmlContent)) {
    errors.push('Content contains dangerous elements (scripts, event handlers, or unsafe protocols)');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
