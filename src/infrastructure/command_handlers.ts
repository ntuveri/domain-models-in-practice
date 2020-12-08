import { Command, ReserveSeat, CancelSeatReservation } from "../domain/commands"
import { ScreenId, Seat, ReservationState, Reservation, CustomerId } from "../domain/domain"
import { EventStore } from "./event_store"
import { DomainEvent } from "../domain/events"


// Command Handler
export interface CommandHandler {
  handleCommand(command: Command): void;
}

export class ReserveSeatHandler implements CommandHandler {
  private eventStore: EventStore
  private publish: (event: DomainEvent) => void

  constructor(eventStore: EventStore, publish: (event: DomainEvent) => void) {
    this.eventStore = eventStore
    this.publish = publish
  }

  handleCommand(command: ReserveSeat): void {
    if (!(command instanceof ReserveSeat)) {
      return
    }

    const customerId = new CustomerId(command.customerId)
    const screenId = new ScreenId(command.screenId)
    const seat = new Seat(command.row, command.col)

    const events = this.eventStore.byScreenId(screenId)
    const reservationState = new ReservationState(events)

    const reservation = new Reservation(reservationState, this.publish)

    reservation.reserveSeat(customerId, screenId, seat)
  }
}


export class CancelSeatReservationHandler implements CommandHandler {
  private eventStore: EventStore
  private publish: (event: DomainEvent) => void

  constructor(eventStore: EventStore, publish: (event: DomainEvent) => void) {
    this.eventStore = eventStore
    this.publish = publish
  }

  handleCommand(command: CancelSeatReservation): void {
    if(!(command instanceof CancelSeatReservation)) {
      return
    }

    let customerId = undefined
    if(command.customerId) {
      customerId = new CustomerId(command.customerId)
    }
    const screenId = new ScreenId(command.screenId)
    const seat = new Seat(command.row, command.col)

    const events = this.eventStore.byScreenId(screenId)
    const reservationState = new ReservationState(events)

    const reservation = new Reservation(reservationState, this.publish)

    reservation.cancelSeatReservation(customerId, screenId, seat)
  }
}

