/**
 * JSON Repair Utility
 * 
 * This utility provides functions to repair malformed JSON that might be returned
 * from the Gemini API. It handles common issues like:
 * - Missing commas
 * - Unescaped quotes in strings
 * - Trailing commas
 * - Malformed nested objects
 */

/**
 * Attempts to repair malformed JSON using a series of techniques
 * @param jsonString The potentially malformed JSON string
 * @returns A repaired JSON string that should be parseable
 */
export const repairJson = (jsonString: string): string => {
  if (!jsonString || typeof jsonString !== 'string') {
    return jsonString;
  }

  // Step 1: Extract JSON from markdown code blocks if present
  const jsonBlockMatch = jsonString.match(/```(?:json)?([\s\S]*?)```/m);
  let processedJson = jsonBlockMatch && jsonBlockMatch[1] 
    ? jsonBlockMatch[1].trim() 
    : jsonString.trim();

  // Step 2: Apply a series of repair techniques
  processedJson = fixMissingCommas(processedJson);
  processedJson = fixTrailingCommas(processedJson);
  processedJson = fixUnescapedQuotes(processedJson);
  processedJson = fixMalformedObjects(processedJson);

  return processedJson;
};

/**
 * Attempts to parse JSON with repairs, returning a valid object or the original string
 * @param jsonString The JSON string to parse
 * @returns Parsed object or the original string if parsing fails
 */
export const safeParseJson = (jsonString: string): any => {
  try {
    // Try to parse directly first
    return JSON.parse(jsonString);
  } catch (e) {
    // If direct parsing fails, try to repair and parse
    try {
      const repaired = repairJson(jsonString);
      return JSON.parse(repaired);
    } catch (repairError) {
      // If all parsing attempts fail, return the original string
      console.warn('Failed to parse JSON even after repair attempts:', repairError);
      return jsonString;
    }
  }
};

/**
 * Fix missing commas between objects in arrays and between properties
 */
const fixMissingCommas = (json: string): string => {
  // Fix missing commas between array elements (objects)
  let result = json.replace(/}(\s*){/g, '},\n$1{');
  
  // Fix missing commas between properties
  result = result.replace(/"([^"]+)"\s*:\s*("[^"]*"|[\d.]+|true|false|null|{[^}]*}|\[[^\]]*\])\s+"/g, '"$1": $2,\n"');
  
  return result;
};

/**
 * Fix trailing commas in objects and arrays
 */
const fixTrailingCommas = (json: string): string => {
  // Remove trailing commas in objects
  let result = json.replace(/,(\s*})/g, '$1');
  
  // Remove trailing commas in arrays
  result = result.replace(/,(\s*\])/g, '$1');
  
  return result;
};

/**
 * Fix unescaped quotes in string values
 */
const fixUnescapedQuotes = (json: string): string => {
  // This is a simplified approach - a full solution would be more complex
  // We're looking for patterns like: "key": "value with "quotes" inside"
  
  // First, let's identify string values
  const stringValueRegex = /"([^"]+)"\s*:\s*"([^"]*)"/g;
  
  return json.replace(stringValueRegex, (match, key, value) => {
    // Escape any unescaped quotes in the value
    const escapedValue = value.replace(/(?<!\\)"/g, '\\"');
    return `"${key}": "${escapedValue}"`;
  });
};

/**
 * Fix malformed nested objects
 */
const fixMalformedObjects = (json: string): string => {
  // This is a simplified approach - a full solution would be more complex
  
  // Balance braces
  let result = json;
  const openBraces = (result.match(/{/g) || []).length;
  const closeBraces = (result.match(/}/g) || []).length;
  
  // Add missing closing braces
  if (openBraces > closeBraces) {
    result += '}'.repeat(openBraces - closeBraces);
  }
  
  // Remove extra closing braces
  if (closeBraces > openBraces) {
    let count = closeBraces - openBraces;
    while (count > 0 && result.endsWith('}')) {
      result = result.slice(0, -1);
      count--;
    }
  }
  
  // Balance brackets
  const openBrackets = (result.match(/\[/g) || []).length;
  const closeBrackets = (result.match(/\]/g) || []).length;
  
  // Add missing closing brackets
  if (openBrackets > closeBrackets) {
    result += ']'.repeat(openBrackets - closeBrackets);
  }
  
  // Remove extra closing brackets
  if (closeBrackets > openBrackets) {
    let count = closeBrackets - openBrackets;
    while (count > 0 && result.endsWith(']')) {
      result = result.slice(0, -1);
      count--;
    }
  }
  
  return result;
};
