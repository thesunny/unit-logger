import mockConsole from "jest-mock-console"
import UnitLogger from ".."

const logger = UnitLogger()
const altLogger = UnitLogger()

describe("UnitLogger", () => {
  let restore: ReturnType<typeof mockConsole>

  beforeEach(() => {
    restore = mockConsole()
  })

  afterEach(() => {
    restore()
  })

  describe("enable and disable logging", () => {
    it("should show logs normally", async () => {
      logger.log("Hello")
      expect(console.log).toHaveBeenCalledWith("Hello")
    })

    it("should enable/disable logs", async () => {
      logger.disable()
      logger.log("alpha")
      expect(console.log).not.toHaveBeenCalled()
      logger.enable()
      logger.log("bravo")
      expect(console.log).toHaveBeenCalledWith("bravo")
    })
  })

  describe("recording of logs", () => {
    it("should startRecording, stopRecording and playRecording", async () => {
      logger.log(1)
      logger.startRecording()
      logger.log(2)
      logger.log(3)
      logger.stopRecording()
      logger.log(4)
      const chunks = logger.playRecording()
      expect(chunks).toEqual([2, 3])
    })

    it("should startRecording, stopRecording and playRecording with complete info", async () => {
      logger.log(1)
      logger.startRecording()
      logger.log(2)
      logger.log(3)
      logger.stopRecording()
      logger.log(4)
      const chunks = logger.playRecording(true)
      restore()
      expect(chunks).toEqual([
        ["log", 2],
        ["log", 3],
      ])
    })
  })

  describe("record", () => {
    it("should record", async () => {
      logger.log(1)
      const chunks = logger.record(() => {
        logger.log(2)
        logger.log(3)
      })
      logger.log(4)
      expect(chunks).toEqual([2, 3])
      expect(console.log).toHaveBeenCalledTimes(4)
    })

    it("should record async", async () => {
      logger.log(1)
      const chunks = await logger.record(async () => {
        logger.log(2)
        logger.log(3)
      })
      logger.log(4)
      expect(chunks).toEqual([2, 3])
      expect(console.log).toHaveBeenCalledTimes(4)
    })

    it("should record return complete", async () => {
      logger.log(1)
      const chunks = logger.record(() => {
        logger.log(2)
        logger.log(3)
      }, true)
      logger.log(4)
      expect(chunks).toEqual([
        ["log", 2],
        ["log", 3],
      ])
      expect(console.log).toHaveBeenCalledTimes(4)
    })
  })

  describe("collect", () => {
    it("should collect", async () => {
      logger.log(1)
      const chunks = logger.collect(() => {
        logger.log(2)
        logger.log(3)
      })
      logger.log(4)
      expect(chunks).toEqual([2, 3])
      expect(console.log).toHaveBeenCalledTimes(2)
    })

    it("should collect async", async () => {
      logger.log(1)
      const chunks = await logger.collect(async () => {
        logger.log(2)
        logger.log(3)
      })
      logger.log(4)
      expect(chunks).toEqual([2, 3])
      expect(console.log).toHaveBeenCalledTimes(2)
    })

    it("should collect return complete", async () => {
      logger.log(1)
      const chunks = logger.collect(() => {
        logger.log(2)
        logger.log(3)
      }, true)
      logger.log(4)
      expect(chunks).toEqual([
        ["log", 2],
        ["log", 3],
      ])
      expect(console.log).toHaveBeenCalledTimes(2)
    })
  })

  describe("multiple loggers", () => {
    it("should handle multiple loggers", async () => {
      logger.startRecording()
      altLogger.startRecording()
      logger.log(1)
      altLogger.log(2)
      const chunks = logger.playRecording()
      const altChunks = altLogger.playRecording()
      restore()
      expect(chunks[0]).toEqual(1)
      expect(altChunks[0]).toEqual(2)
    })
  })
})
