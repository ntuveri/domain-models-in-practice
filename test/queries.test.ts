import {
  Row,
  Col,
  Seat,
  ScreenId,
} from "../src/domain/domain"

import {
  ScreenScheduled,
} from "../src/domain/events"


import { Framework, FrameworkFactory } from "./framework"
import { GetAvailableSeats, GetAvailableSeatsResponse } from "../src/domain/queries"
import { Timer } from "../src/infrastructure/timer"

describe("The customer wants to see the available seats of the screening", () => {

  let framework: Framework

  beforeEach(() => {
    framework = FrameworkFactory.createFramework()
  })

  it("If seats are available, the seats should be listed.", async () => {
    const screenStartTime = Timer.currentTime;
    const screenId = new ScreenId('screen1')
    const screenId2 = new ScreenId('screen2')
    const { given, whenQuery, thenExpectResponse } = framework

    given([
      new ScreenScheduled(screenId, screenStartTime, [new Seat(Row.A, Col.ONE), new Seat(Row.B, Col.ONE)]),
      new ScreenScheduled(screenId2, screenStartTime, [new Seat(Row.A, Col.TWO)]),
    ])
    whenQuery(new GetAvailableSeats(screenId.value()))
    thenExpectResponse([
      new GetAvailableSeatsResponse(screenId, [new Seat(Row.A, Col.ONE), new Seat(Row.B, Col.ONE)])
    ])
  })
})
