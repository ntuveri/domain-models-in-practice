import { DomainEvent, ScreenScheduled, SeatReserved, SeatReservationCanceled } from "./events"
import { ScreenId, Seat, ReservedSeat } from "./domain"

// Read Model
export interface ReadModel {
  project: (event: DomainEvent) => void
}

export class AvailableSeatsByScreen implements ReadModel {

  public readonly availableSeats: Map<String, Seat[]> = new Map<String, Seat[]>()

  constructor(events: DomainEvent[]) {
    for (const event of events) {
      this.apply(event)
    }
  }

  public project(event: DomainEvent) {
    this.apply(event)
  }

  private apply(event: DomainEvent) {
    if (event instanceof ScreenScheduled) {
      this.availableSeats.set(event.screenId.value(), event.seats)
    }

    if (event instanceof SeatReserved) {
      let availableSeatsByScreen = this.availableSeats.get(event.screenId.value())!
      availableSeatsByScreen = availableSeatsByScreen.filter(s => !s.equals(event.seat))
      this.availableSeats.set(event.screenId.value(), availableSeatsByScreen)
    }

    if (event instanceof SeatReservationCanceled) {
      let availableSeatsByScreen = this.availableSeats.get(event.screenId.value())!
      availableSeatsByScreen.push(event.seat)
      this.availableSeats.set(event.screenId.value(), availableSeatsByScreen)
    }
  }
}


export class ReservedSeatsByScreen implements ReadModel {

  public readonly reservedSeats: Map<String, ReservedSeat[]> = new Map<String, ReservedSeat[]>()

  constructor(events: DomainEvent[]) {
    for (const event of events) {
      this.apply(event)
    }
  }

  public project(event: DomainEvent) {
    this.apply(event)
  }

  private apply(event: DomainEvent) {
    if (event instanceof ScreenScheduled) {
      this.reservedSeats.set(event.screenId.value(), [])
    }

    if (event instanceof SeatReserved) {
      const reservedSeatsByScreen = this.reservedSeats.get(event.screenId.value())!
      const reservedSeat = new ReservedSeat(event.seat.row, event.seat.col, event.reservationTime, event.customerId, event.screenId) 
      reservedSeatsByScreen.push(reservedSeat)
      this.reservedSeats.set(event.screenId.value(), reservedSeatsByScreen)
    }

    if (event instanceof SeatReservationCanceled) {
      let reservedSeatsByScreen = this.reservedSeats.get(event.screenId.value())!
      reservedSeatsByScreen = reservedSeatsByScreen.filter(s => !s.equals(event.seat))
      this.reservedSeats.set(event.screenId.value(), reservedSeatsByScreen)
    }
  }
}

