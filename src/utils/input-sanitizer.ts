const MAX_INPUT_LENGTH = 500;

const INJECTION_PATTERNS = [
  /###/g,
  /---+/g,
  /\[INST\]/gi,
  /\[\/INST\]/gi,
  /<\|system\|>/gi,
  /<\|user\|>/gi,
  /<\|assistant\|>/gi,
  /<<SYS>>/gi,
  /<<\/SYS>>/gi,
];

export function sanitizeUserInput(input: string): string {
  if (!input) return "";

  let sanitized = input;

  for (const pattern of INJECTION_PATTERNS) {
    sanitized = sanitized.replace(pattern, "");
  }

  if (sanitized.length > MAX_INPUT_LENGTH) {
    sanitized = sanitized.slice(0, MAX_INPUT_LENGTH);
  }

  return sanitized;
}
