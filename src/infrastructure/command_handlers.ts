import { Command, ReserveSeat } from "../domain/commands"
import { CustomerId, ScreenId, Seat, ReservationState, Reservation } from "../domain/domain"
import { EventStore } from "./event_store"


// Command Handler
export interface CommandHandler<T extends Command> {
  handleCommand(command: T): void;
}

export class ReserveSeatHandler implements CommandHandler<ReserveSeat> {
  private eventStore: EventStore
  private publish: (event: Object) => void

  constructor(eventStore: EventStore, publish: (event: Object) => void) {
    this.eventStore = eventStore
    this.publish = publish
  }

  handleCommand(command: ReserveSeat): void {
    const customerId = new CustomerId(command.customerId)
    const screenId = new ScreenId(command.screenId)
    const seat = new Seat(command.row, command.col)

    const events = this.eventStore.byScreenId(screenId)
    const reservationState = new ReservationState(events)

    const reservation = new Reservation(reservationState, this.publish)

    reservation.reserveSeat(customerId, screenId, seat)
  }
}
