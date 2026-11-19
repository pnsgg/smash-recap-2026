export type LogFields = Record<string, unknown>
export type LogLevel = 'info' | 'error'
export type LogSink = (level: LogLevel, line: string) => void

const stdout: LogSink = (level, line) => (level === 'error' ? process.stderr : process.stdout).write(`${line}\n`)
const silent: LogSink = () => {}

const replacer = (_key: string, value: unknown) =>
  value instanceof Error ? { type: value.name, message: value.message } : typeof value === 'bigint' ? String(value) : value

class Logger {
  private sink: LogSink = Bun.env.NODE_ENV === 'test' ? silent : stdout

  info(fields: LogFields) {
    this.write('info', fields)
  }

  error(fields: LogFields) {
    this.write('error', fields)
  }

  useSink(sink: LogSink): LogSink {
    const previous = this.sink
    this.sink = sink
    return previous
  }

  private write(level: LogLevel, fields: LogFields) {
    const line = { timestamp: new Date().toISOString(), level, ...fields }
    this.sink(level, JSON.stringify(line, replacer))
  }
}

export const logger = new Logger()
