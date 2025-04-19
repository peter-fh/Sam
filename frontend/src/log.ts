export enum LogLevel {
  Always = "",
  Error = "ERROR",
  Warning = "WARNING",
  Debug = "DEBUG",
}

const isDebugMode = () => {
  return import.meta.env.MODE == "development"
}

export function Log(level: LogLevel, ...args: any[]) {
  if (level == LogLevel.Debug && !isDebugMode()) {
    return
  }

  console.log(level, ...args)
}

