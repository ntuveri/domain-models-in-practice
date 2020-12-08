import { ScreenId, Seat, CustomerId } from "./domain"

export interface DomainEvent { }

// Event
export class SeatReserved implements DomainEvent {
  readonly customerId: CustomerId
  readonly screenId: ScreenId
  readonly seat: Seat
  readonly reservationTime: Date

  constructor(customerId: CustomerId, screenId: ScreenId, seat: Seat, reservationTime: Date) {
    this.customerId = customerId
    this.screenId = screenId
    this.seat = seat
    this.reservationTime = reservationTime
  }
}

export class SeatReservationRefused implements DomainEvent {
  readonly customerId: CustomerId
  readonly screenId: ScreenId
  readonly seat: Seat

  constructor(customerId: CustomerId, screenId: ScreenId, seat: Seat) {
    this.customerId = customerId
    this.screenId = screenId
    this.seat = seat
  }
}

export class ScreenScheduled implements DomainEvent {
  readonly screenId: ScreenId
  readonly startTime: Date
  readonly seats: Seat[]

  constructor(screenId: ScreenId, startTime: Date, seats: Seat[]) {
    this.screenId = screenId
    this.startTime = startTime
    this.seats = seats
  }
}

export class SeatReservationCanceled implements DomainEvent {
  readonly customerId: CustomerId | undefined
  readonly screenId: ScreenId
  readonly seat: Seat

  constructor(customerId: CustomerId | undefined, screenId: ScreenId, seat: Seat) {
    this.customerId = customerId
    this.screenId = screenId
    this.seat = seat
  }
}

export class TimePassed implements DomainEvent {
  readonly time: Date

  constructor(time: Date) {
    this.time = time
  }
}

