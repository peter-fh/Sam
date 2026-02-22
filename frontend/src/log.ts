export enum LogLevel {
  Always = "",
  Error = "ERROR",
  Warning = "WARNING",
  Debug = "DEBUG",
  Info = "INFO",
}

const isDebugMode = () => {
  return import.meta.env.MODE == "development"
}

export function Log(level: LogLevel, ...args: any[]) {
  if (!isDebugMode()) {
    if (level == LogLevel.Info) {
      return
    }
    if (level == LogLevel.Debug) {
      return
    }
  }

  console.log(level, ...args)
}

