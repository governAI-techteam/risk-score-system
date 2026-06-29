/**
 * Obfuscation Normalizer Service
 * Handles de-obfuscation layers: Unicode normalization, homoglyphs translation,
 * base64 auto-decoding, hex auto-decoding, delimiter stripping, and leetspeak conversion.
 */
class Normalizer {
  constructor() {
    // Cyrillic and Greek lookalike character map to standard ASCII
    this.homoglyphs = {
      // Cyrillic lowercase
      'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ж': 'zh', 'з': 'z',
      'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p',
      'р': 'r', 'с': 'c', 'т': 't', 'у': 'y', 'ф': 'f', 'х': 'x', 'ц': 'ts', 'ч': 'ch',
      'ш': 'sh', 'щ': 'shch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
      'і': 'i', 'ї': 'yi', 'є': 'ye',
      // Cyrillic uppercase
      'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ж': 'Zh', 'З': 'Z',
      'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N', 'О': 'O', 'П': 'P',
      'Р': 'P', 'С': 'C', 'Т': 'T', 'У': 'Y', 'Ф': 'F', 'Х': 'X', 'Ц': 'Ts', 'Ч': 'Ch',
      'Ш': 'Sh', 'Щ': 'Shch', 'Ъ': '', 'Ы': 'Y', 'Ь': '', 'Э': 'E', 'Ю': 'Yu', 'Я': 'Ya',
      // Greek lookalikes
      'α': 'a', 'β': 'b', 'γ': 'g', 'ε': 'e', 'η': 'h', 'θ': 'th', 'ι': 'i', 'κ': 'k',
      'λ': 'l', 'μ': 'm', 'ν': 'n', 'ο': 'o', 'π': 'p', 'ρ': 'r', 'σ': 's', 'τ': 't',
      'υ': 'u', 'χ': 'x', 'ω': 'o',
      'Α': 'A', 'Β': 'B', 'Γ': 'G', 'Δ': 'D', 'Ε': 'E', 'Ζ': 'Z', 'Η': 'H', 'Θ': 'Th',
      'Ι': 'I', 'Κ': 'K', 'Λ': 'L', 'Μ': 'M', 'Ν': 'N', 'Ξ': 'X', 'Ο': 'O', 'Π': 'P',
      'Р': 'P', 'Σ': 'S', 'Τ': 'T', 'Υ': 'Y', 'Φ': 'F', 'Χ': 'X', 'Ψ': 'Ps', 'Ω': 'O'
    };

    // Leetspeak translation map
    this.leetspeak = {
      '4': 'a', '@': 'a',
      '3': 'e',
      '1': 'i', '!': 'i', '|': 'i',
      '0': 'o',
      '5': 's', '$': 's',
      '7': 't', '+': 't',
      '8': 'b',
      '9': 'g'
    };
  }

  /**
   * Main normalize method. Applies all sanitization and de-obfuscation rules.
   * @param {string} text 
   * @returns {string} Normalized text
   */
  normalize(text) {
    if (!text || typeof text !== 'string') return '';

    // 1. Unicode Standard Normalization (NFKC combines composite characters)
    let normalized = text.normalize('NFKC');

    // 2. Decode Hex escape sequences (e.g. \x69\x67 or &#x69;)
    normalized = this.decodeHexAndHtmlEntities(normalized);

    // 3. Resolve homoglyph substitutions
    normalized = this.resolveHomoglyphs(normalized);

    // 4. Resolve spacing/delimiter bypasses (e.g., i.g.n.o.r.e or i-g-n-o-r-e)
    normalized = this.resolveSplitWords(normalized);

    // 5. Decode Base64 blocks if they contain valid ASCII text
    normalized = this.decodeBase64Blocks(normalized);

    // 6. Generate a secondary leetspeak-free representation and merge it
    // We append the leet-normalized text so regex checks looking for normal words still match
    const leetNormalized = this.resolveLeetSpeak(normalized);
    if (leetNormalized !== normalized) {
      normalized = normalized + '\n' + leetNormalized;
    }

    return normalized;
  }

  /**
   * Converts hex sequences (like \x69) and HTML entities into ASCII
   */
  decodeHexAndHtmlEntities(text) {
    let result = text;

    // Decode \xHH hex sequences
    result = result.replace(/\\x([0-9a-fA-F]{2})/g, (match, hex) => {
      return String.fromCharCode(parseInt(hex, 16));
    });

    // Decode &#xHH; or &#DD; HTML entities
    result = result.replace(/&#x([0-9a-fA-F]+);/g, (match, hex) => {
      return String.fromCharCode(parseInt(hex, 16));
    });
    result = result.replace(/&#([0-9]+);/g, (match, dec) => {
      return String.fromCharCode(parseInt(dec, 10));
    });

    return result;
  }

  /**
   * Replaces homoglyphs (lookalike characters) with standard English letters
   */
  resolveHomoglyphs(text) {
    let chars = [...text];
    for (let i = 0; i < chars.length; i++) {
      if (this.homoglyphs[chars[i]] !== undefined) {
        chars[i] = this.homoglyphs[chars[i]];
      }
    }
    return chars.join('');
  }

  /**
   * Merges words that have been split by spaces or punctuation (e.g. i.g.n.o.r.e -> ignore)
   */
  resolveSplitWords(text) {
    // Regex matches single letters separated by a space or common punctuation
    // e.g. "i.g.n.o.r.e" or "i-g-n-o-r-e" or "i g n o r e"
    // We look for at least 3 characters split in a row.
    const splitRegex = /\b(?:[a-zA-Z][\s._,\-\/\\]){2,}[a-zA-Z]\b/g;
    
    return text.replace(splitRegex, (match) => {
      // Strip all separating characters
      return match.replace(/[\s._,\-\/\\]/g, '');
    });
  }

  /**
   * Automatically detects, decodes, and appends Base64 encoded sub-blocks
   */
  decodeBase64Blocks(text) {
    // Regex for Base64 sequences (multiples of 4 characters, 8 or more characters total)
    const b64Regex = /\b([A-Za-z0-9+/]{4}){2,}(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?(?![A-Za-z0-9+/])/g;
    
    let decodedSegments = [];
    let match;
    
    // Reset regex lastIndex
    b64Regex.lastIndex = 0;
    
    while ((match = b64Regex.exec(text)) !== null) {
      const candidate = match[0];
      
      try {
        const decoded = Buffer.from(candidate, 'base64').toString('utf-8');
        
        // Validation: Verify the decoded string contains printable, standard ASCII text
        const isPrintable = /^[\x20-\x7E\r\n\t]+$/.test(decoded);
        
        if (isPrintable && decoded.trim().length > 4) {
          // If the decoded text contains known security keywords, save it
          const containsKeywords = /ignore|system|prompt|reveal|bypass|instructions|rules/i.test(decoded);
          if (containsKeywords) {
            decodedSegments.push(decoded.trim());
          }
        }
      } catch (err) {
        // Not valid base64, skip
      }
    }
    
    if (decodedSegments.length > 0) {
      return text + '\n[Decoded Attack Payload]: ' + decodedSegments.join(' ');
    }
    
    return text;
  }

  /**
   * Replaces numerical leetspeak characters with equivalent letters
   */
  resolveLeetSpeak(text) {
    let result = text.toLowerCase();
    
    // We only replace if the leetspeak characters are embedded in words
    // to avoid translating standard dates, math, or ID fields.
    // Replace standard digits with equivalents
    let chars = [...result];
    for (let i = 0; i < chars.length; i++) {
      const char = chars[i];
      if (this.leetspeak[char] !== undefined) {
        // Check neighbors to make sure it is likely leetspeak (surrounded by letters)
        const prev = i > 0 ? chars[i - 1] : ' ';
        const next = i < chars.length - 1 ? chars[i + 1] : ' ';
        
        const isPrevLetter = /[a-z]/i.test(prev);
        const isNextLetter = /[a-z]/i.test(next);
        
        if (isPrevLetter || isNextLetter) {
          chars[i] = this.leetspeak[char];
        }
      }
    }
    
    return chars.join('');
  }
}

export default new Normalizer();
