import {
  Row,
  Col,
  Seat,
  ScreenId,
  CustomerId,
} from "../src/domain/domain"

import {
  ScreenScheduled, SeatReserved,
} from "../src/domain/events"


import { Framework, FrameworkFactory } from "./framework"
import { GetAvailableSeats, GetAvailableSeatsResponse } from "../src/domain/queries"
import { ReserveSeat } from "../src/domain/commands"
import { Timer } from "../src/infrastructure/timer"

describe("The customer wants to researve seats and see the remaining available seats of the screening", () => {

  let framework: Framework

  beforeEach(() => {
    framework = FrameworkFactory.createFramework()
  })

  it("If a seat is reserved, remaining available seats should be listed.", async () => {
    const screenStartTime = new Date(Timer.currentTime.getTime() + (20 * 60 * 1000));
    const screenId = new ScreenId('screen1')
    const customerId = new CustomerId("customer1")
    const customerId2 = new CustomerId("customer2")
    const { given, when, whenQuery, thenExpectResponse } = framework

    given([
      new ScreenScheduled(screenId, screenStartTime, 
        [new Seat(Row.A, Col.ONE), new Seat(Row.B, Col.ONE), 
          new Seat(Row.C, Col.ONE), new Seat(Row.D, Col.ONE)]),
      new SeatReserved(customerId, screenId, new Seat(Row.A, Col.ONE), Timer.currentTime)
    ])
    when(new ReserveSeat(customerId2.value(), screenId.value(), Row.B, Col.ONE))
    whenQuery(new GetAvailableSeats(screenId.value()))
    thenExpectResponse([
      new GetAvailableSeatsResponse(screenId, [new Seat(Row.C, Col.ONE), new Seat(Row.D, Col.ONE)])
    ])
  })
})
