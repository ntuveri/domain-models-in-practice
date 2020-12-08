import { DomainEvent, ScreenScheduled, SeatReserved, SeatReservationRefused, SeatReservationCanceled } from "./events"
import { Timer } from "../infrastructure/timer"

export enum Row {
  A,
  B,
  C,
  D,
}

export enum Col {
  ONE,
  TWO,
  THREE,
  FOUR,
}

// Value Object
export class Seat {
  constructor(readonly row: Row, readonly col: Col) {
    this.row = row
    this.col = col
  }

  equals(obj: Seat): boolean {
    return this.row === obj.row && this.col === obj.col
  }

  toString() {
    return `${this.row}${this.col}`
  }
}

export class ReservedSeat extends Seat {
  constructor(row: Row, col: Col, readonly reservationTime: Date, readonly customerId: CustomerId, readonly screenId: ScreenId) {
    super(row, col)
  }
}

export class CustomerId {
  private readonly id: string

  constructor(id: string) {
    this.id = id
  }

  value(): string {
    return this.id;
  }

  equals(obj: CustomerId): boolean {
    return this.id === obj.id
  }
}

export class ScreenId {
  private readonly id: string

  constructor(id: string) {
    this.id = id
  }

  value(): string {
    return this.id;
  }

  equals(obj: ScreenId): boolean {
    return this.id === obj.id
  }
}

export class Screen {
  readonly screenId: ScreenId;
  readonly startTime: Date;
  readonly seats: Seat[];

  constructor(screenId: ScreenId, startTime: Date, seats: Seat[]) {
    this.screenId = screenId;
    this.startTime = startTime
    this.seats = seats
  }
}

// Aggregate state
export class ReservationState {
  reservedSeats: Seat[] = []
  screen?: Screen

  constructor(events: DomainEvent[]) {
    for (const event of events) {
      this.apply(event)
    }
  }

  apply(event: DomainEvent) {
    if (event instanceof ScreenScheduled) {
      this.screen = new Screen(event.screenId, event.startTime, event.seats)
    }

    if (event instanceof SeatReserved) {
      this.reservedSeats.push(event.seat)
    }

    if (event instanceof SeatReservationCanceled) {
      this.reservedSeats = this.reservedSeats.filter(rs => !rs.equals(event.seat))
    }
  }
}

// Aggregate
export class Reservation {
  reservationState: ReservationState
  publish: (event: DomainEvent) => void

  constructor(reservationState: ReservationState, publish: (event: DomainEvent) => void) {
    this.reservationState = reservationState
    this.publish = publish
  }

  isOnTime() {
    let screen = this.reservationState.screen;
    return screen && screen.startTime > new Date(Timer.currentTime.getTime() + (15 * 60 * 1000))
  }

  isAvailable(seat: Seat) {
    return !this.reservationState.reservedSeats.find((s) => s.equals(seat)) && 
      this.reservationState.screen?.seats.find((s) => s.equals(seat)) 
  }

  isReserved(seat: Seat) {
    return this.reservationState.reservedSeats.find((s) => s.equals(seat))
  }

  canBook(seat: Seat) {
    return this.isOnTime() && this.isAvailable(seat)
  }

  reserveSeat(customerId: CustomerId, screenId: ScreenId, seat: Seat) {
    if (this.canBook(seat)) this.publish(new SeatReserved(customerId, screenId, seat, Timer.currentTime))
    else this.publish(new SeatReservationRefused(customerId, screenId, seat))
  }

  cancelSeatReservation(customerId: CustomerId | undefined, screenId: ScreenId, seat: Seat) {
    if (this.isReserved(seat)) this.publish(new SeatReservationCanceled(customerId, screenId, seat))
  }
}
