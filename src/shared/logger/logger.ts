import dayjs from "dayjs";

// Logger estruturado para substituir console.log

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
  [key: string]: unknown;
}

function Logger() {
  const formatTimestamp = (): string => {
    return dayjs().format("YYYY-MM-DD HH:mm:ss");
  };

  const getEmoji = (level: LogLevel): string => {
    const emojis: Record<LogLevel, string> = {
      debug: "🔍",
      info: "ℹ️",
      warn: "⚠️",
      error: "❌",
    };
    return emojis[level];
  };

  const log = (
    level: LogLevel,
    message: string,
    context?: LogContext
  ): void => {
    const emoji = getEmoji(level);
    const timestamp = formatTimestamp();

    const formattedMessage = `${emoji} [${timestamp}] ${level.toUpperCase()}: ${message}`;

    if (context && Object.keys(context).length > 0) {
      console.log(formattedMessage, context);
    } else {
      console.log(formattedMessage);
    }
  };

  // Retornar objeto com métodos públicos
  return {
    debug(message: string, context?: LogContext): void {
      log("debug", message, context);
    },

    info(message: string, context?: LogContext): void {
      log("info", message, context);
    },

    warn(message: string, context?: LogContext): void {
      log("warn", message, context);
    },

    error(message: string, context?: LogContext): void {
      log("error", message, context);
    },
  };
}

export const logger = Logger();
