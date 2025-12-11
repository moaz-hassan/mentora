import sanitizeHtml from 'sanitize-html';


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
  
  allowedClasses: {
    'code': ['language-*', 'hljs', 'hljs-*'],
    'pre': ['language-*', 'hljs'],
    'div': ['code-block'],
    'span': ['hljs-*']
  }
};


export const sanitizeLessonContent = (htmlContent) => {
  if (!htmlContent || typeof htmlContent !== 'string') {
    return '';
  }

  
  const sanitized = sanitizeHtml(htmlContent, sanitizeOptions);

  return sanitized;
};


export const containsDangerousContent = (htmlContent) => {
  if (!htmlContent) return false;

  
  if (/<script[\s\S]*?>[\s\S]*?<\/script>/gi.test(htmlContent)) {
    return true;
  }

  
  if (/on\w+\s*=/gi.test(htmlContent)) {
    return true;
  }

  
  if (/javascript:/gi.test(htmlContent)) {
    return true;
  }

  
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
