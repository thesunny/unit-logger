export default function UnitLogger(initialLogEnabled: boolean = true) {
  /**
   * https://stackoverflow.com/questions/21876461/difference-between-console-log-and-console-debug
   */
  type LogLevel = "debug" | "log" | "info" | "warn" | "error"

  type LogEntry = [LogLevel, unknown]

  let buffer: LogEntry[] = []
  let logEnabled = initialLogEnabled
  let recordEnabled = false

  function debug(s: unknown) {
    if (logEnabled) console.debug(s)
    if (recordEnabled) buffer.push(["debug", s])
  }

  function log(s: unknown) {
    if (logEnabled) console.log(s)
    if (recordEnabled) buffer.push(["log", s])
  }

  function info(s: unknown) {
    if (logEnabled) console.info(s)
    if (recordEnabled) buffer.push(["info", s])
  }

  function warn(s: unknown) {
    if (logEnabled) console.warn(s)
    if (recordEnabled) buffer.push(["warn", s])
  }

  function error(s: unknown) {
    if (logEnabled) console.error(s)
    if (recordEnabled) buffer.push(["error", s])
  }

  /**
   * Turn logging to console on
   */
  function enable() {
    logEnabled = true
  }

  /**
   * Turn logging to console off
   */
  function disable() {
    logEnabled = false
  }

  /**
   * Start recording of logging
   */
  function startRecording() {
    recordEnabled = true
  }

  /**
   * Stop recording of logging
   */
  function stopRecording() {
    recordEnabled = false
  }

  /**
   * Play recording of logging and clear the recording from the buffer
   */
  function playRecording(complete = false): unknown[] {
    const oldBuffer = buffer
    buffer = []
    if (complete) {
      return oldBuffer
    } else {
      return oldBuffer.map((entry) => entry[1])
    }
  }

  /**
   * Record logs while the passed in function executes and then return it.
   *
   * During this time, we are also logging to the console if it was previously
   * turned on.
   *
   * The language is meant to evoke that the logging is still happening to the
   * console (if it was on) and we are merely making a copy (recording) of it.
   */
  function record(fn: () => void, complete?: boolean): unknown[]
  function record(
    fn: () => Promise<void>,
    complete?: boolean
  ): Promise<unknown[]>
  function record(
    fn: () => void | Promise<void>,
    complete = false
  ): unknown[] | Promise<unknown[]> {
    startRecording()
    const maybePromise = fn()
    if (maybePromise) {
      return maybePromise.then(() => {
        stopRecording()
        return playRecording(complete)
      })
    } else {
      stopRecording()
      return playRecording(complete)
    }
  }

  /**
   * Collects logs while the passed in function executes and then return it
   * while hiding any `console.log` output even if the console is enabled.
   *
   * The language is meant to evoke that it **collects** the record for itself
   * (i.e. it is not shareing it).
   */
  function silence(fn: () => void): void
  function silence(fn: () => Promise<void>): Promise<void>
  function silence(fn: () => void | Promise<void>): void | Promise<void> {
    const wasLogEnabled = logEnabled
    logEnabled = false
    const promiseOrResult = record(fn)
    if (promiseOrResult instanceof Promise) {
      return promiseOrResult.then((r) => {
        logEnabled = wasLogEnabled
        return r
      })
    } else {
      logEnabled = wasLogEnabled
    }
  }

  /**
   * Collects logs while the passed in function executes and then return it
   * while hiding any `console.log` output even if the console is enabled.
   *
   * The language is meant to evoke that it **collects** the record for itself
   * (i.e. it is not shareing it).
   */
  function collect(fn: () => void, complete?: boolean): unknown[]
  function collect(
    fn: () => Promise<void>,
    complete?: boolean
  ): Promise<unknown[]>
  function collect(
    fn: () => void | Promise<void>,
    complete = false
  ): unknown[] | Promise<unknown[]> {
    const wasLogEnabled = logEnabled
    logEnabled = false
    const promiseOrResult = record(fn, complete)
    if (promiseOrResult instanceof Promise) {
      return promiseOrResult.then((r) => {
        logEnabled = wasLogEnabled
        return r
      })
    } else {
      logEnabled = wasLogEnabled
      return promiseOrResult
    }
  }

  return {
    debug,
    log,
    info,
    warn,
    error,
    enable,
    disable,
    startRecording,
    stopRecording,
    playRecording,
    record,
    silence,
    collect,
  }
}
