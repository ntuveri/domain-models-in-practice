import {
  Row,
  Col,
  Seat,
  ScreenId,
  CustomerId,
} from "../src/domain/domain"

import {
  ScreenScheduled,
  SeatReserved,
  SeatReservationCanceled,
  TimePassed,
} from "../src/domain/events"


import { Framework, FrameworkFactory } from "./framework"
import { Timer } from "../src/infrastructure/timer"
import { CancelSeatReservation } from "../src/domain/commands"

describe("If no booking happens within 12 minutes, the reservation is cancelled", () => {

  let framework: Framework

  beforeEach(() => {
    framework = FrameworkFactory.createFramework()
  })

  it("If seats were reserved for more than 12 minutes, the seat reservation should be cancelled.", async () => {
    const screenStartTime = Timer.currentTime;
    const expiredReservationTime = new Date(Timer.currentTime.getTime() - (13 * 60 * 1000));
    const validReservationTime = new Date(Timer.currentTime.getTime() - (11 * 60 * 1000));
    const screenId = new ScreenId('screen1')
    const customerId = new CustomerId("customer1")
    const { given, whenEvent, thenExpect, thenExpectTrigger } = framework

    given([
      new ScreenScheduled(screenId, screenStartTime, [new Seat(Row.A, Col.ONE), new Seat(Row.A, Col.TWO)]),
      new SeatReserved(customerId, screenId, new Seat(Row.A, Col.ONE), expiredReservationTime),
      new SeatReserved(customerId, screenId, new Seat(Row.A, Col.TWO), validReservationTime)
    ])
    whenEvent(new TimePassed(Timer.currentTime))
    thenExpectTrigger([
      new CancelSeatReservation(null, screenId.value(), Row.A, Col.ONE)
    ])
    thenExpect([
      new SeatReservationCanceled(undefined, screenId, new Seat(Row.A, Col.ONE))
    ])
  })
})