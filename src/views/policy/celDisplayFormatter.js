export const MAX_WRAPPED_CEL_LINE_LENGTH = 10000;

export function hasLongLine(value, maximumLineLength) {
  let lineLength = 0;

  for (let index = 0; index < value.length; index++) {
    if (value[index] === '\n') {
      lineLength = 0;
      continue;
    }

    lineLength++;
    if (lineLength > maximumLineLength) {
      return true;
    }
  }

  return false;
}

export function formatCelForDisplay(value) {
  let result = '';
  let quote = null;
  let tripleQuoted = false;
  let escaped = false;
  let lineComment = false;
  let blockComment = false;

  for (let index = 0; index < value.length; index++) {
    const character = value[index];
    const nextCharacter = value[index + 1];

    if (lineComment) {
      result += character;
      if (character === '\n') {
        lineComment = false;
      }
      continue;
    }

    if (blockComment) {
      result += character;
      if (character === '*' && nextCharacter === '/') {
        result += nextCharacter;
        index++;
        blockComment = false;
      }
      continue;
    }

    if (quote) {
      if (
        tripleQuoted &&
        character === quote &&
        nextCharacter === quote &&
        value[index + 2] === quote
      ) {
        result += quote + quote + quote;
        index += 2;
        quote = null;
        tripleQuoted = false;
        continue;
      }

      result += character;
      if (!tripleQuoted && character === quote && !escaped) {
        quote = null;
      }
      escaped = character === '\\' && !escaped;
      if (character !== '\\') {
        escaped = false;
      }
      continue;
    }

    if (character === '/' && nextCharacter === '/') {
      result += character + nextCharacter;
      index++;
      lineComment = true;
      continue;
    }

    if (character === '/' && nextCharacter === '*') {
      result += character + nextCharacter;
      index++;
      blockComment = true;
      continue;
    }

    if (character === '"' || character === "'") {
      quote = character;
      tripleQuoted =
        nextCharacter === character && value[index + 2] === character;
      if (tripleQuoted) {
        result += character + character + character;
        index += 2;
      } else {
        result += character;
      }
      escaped = false;
      continue;
    }

    if (
      (character === '|' && nextCharacter === '|') ||
      (character === '&' && nextCharacter === '&')
    ) {
      if (result.length > 0 && result[result.length - 1] !== '\n') {
        result += '\n';
      }
      result += character + nextCharacter;
      index++;
      continue;
    }

    result += character;
  }

  return result;
}
