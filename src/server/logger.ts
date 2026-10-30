export interface LogContext {
  [key: string]: unknown;
}

function formatLine(
  level: 'INFO' | 'WARN' | 'ERROR',
  message: string,
  context?: LogContext,
): string {
  const suffix = context && Object.keys(context).length > 0 ? ` ${JSON.stringify(context)}` : '';
  return `[${level}] ${message}${suffix}`;
}

export const logger = {
  info(message: string, context?: LogContext): void {
    process.stdout.write(`${formatLine('INFO', message, context)}\n`);
  },
  warn(message: string, context?: LogContext): void {
    console.warn(formatLine('WARN', message, context));
  },
  error(message: string, context?: LogContext): void {
    console.error(formatLine('ERROR', message, context));
  },
};
