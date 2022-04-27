export default function UnitLogger(initialLogEnabled: boolean = true) {
  let buffer: unknown[] = []
  let logEnabled = initialLogEnabled
  let recordEnabled = false

  function log(s: unknown) {
    if (logEnabled) console.log(s)
    if (recordEnabled) buffer.push(s)
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
  function playRecording(): unknown[] {
    const oldBuffer = buffer
    buffer = []
    return oldBuffer
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
  function record(fn: () => void): unknown[]
  function record(fn: () => Promise<void>): Promise<unknown[]>
  function record(
    fn: () => void | Promise<void>
  ): unknown[] | Promise<unknown[]> {
    startRecording()
    const maybePromise = fn()
    if (maybePromise) {
      return maybePromise.then(() => {
        stopRecording()
        return playRecording()
      })
    } else {
      stopRecording()
      return playRecording()
    }
  }

  /**
   * Collects logs while the passed in function executes and then return it
   * while hiding any `console.log` output even if the console is enabled.
   *
   * The language is meant to evoke that it **collects** the record for itself
   * (i.e. it is not shareing it).
   */
  function collect(fn: () => void): unknown[]
  function collect(fn: () => Promise<void>): Promise<unknown[]>
  function collect(
    fn: () => void | Promise<void>
  ): unknown[] | Promise<unknown[]> {
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
      return promiseOrResult
    }
  }

  return {
    log,
    enable,
    disable,
    startRecording,
    stopRecording,
    playRecording,
    record,
    collect,
  }
}
