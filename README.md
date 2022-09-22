# Unit Logger

An alternative to console.log that can be unit tested because:

- It can optionally suppress console.log during a unit test so as not to dirty console output.
- It can easily read what was output and the values can be tested without creating a mock console object.
- Can create multiple loggers and the values output from each one can be tested independently from the others
- The independent loggers also means that unlike a mock console, you only will be reading the values for your logger and not console.log output from other code (e.g. an application or NPM package)
- You can export your logger from your package so that others can also test the output of your logger

## Usage

```typescript
import UnitLogger from "unit-logger"

const logger = UnitLogger()

// logs output
logger.log("Hello World")

// disable console.log
logger.disable()

// not shown in console
logger.log("Hello World")

// enable console.log
logger.enable()

// record output
const log = logger.record(() => {
  logger.log(1)
  logger.log(2)
})
// => [1, 2]

// record output asynchronously
const asyncLog = logger.record(async () => {
  logger.log(1)
  logger.log(2)
})
// => [1, 2]

// record output using method calls
logger.startRecording()
logger.log(1)
logger.log(2)
logger.stopRecording()

// get the recording and clear the recording buffer
const altLog = logger.playRecording()
// => [1, 2]

// Get a complete log with log levels (and also how to use different log levels)
const completeLog = logger.record(() => {
  // supports debug, log, info, warn, error
  logger.log(1)
  logger.info(2)
}, true) // we pass `true` as second argument
// result comes out as tuples
// => [["log", 1], ["info", 2]]

// Show complete log with recording method
logger.startRecording()
logger.log(1)
logger.log(2)
logger.stopRecording()

// get the recording and clear the recording buffer
const altLog = logger.playRecording(true)
// [["log", 1], ["info", 2]]
```
