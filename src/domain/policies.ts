import { DomainEvent, TimePassed } from "./events";
import { ReservedSeatsByScreen } from "./read_models";
import { Command, CancelSeatReservation } from "./commands";
import { Timer } from "../infrastructure/timer";

export interface Policy {
  handleEvent(event: DomainEvent): void;
}


export class SeatReservationExpiredPolicy implements Policy {
  private readModel: ReservedSeatsByScreen
  private publish: (command: Command) => void

  constructor(readModel: ReservedSeatsByScreen, publish: (command: Command) => void) {
    this.readModel = readModel
    this.publish = publish
  }

  handleEvent(event: TimePassed): void {
    if (!(event instanceof TimePassed)) {
      return
    }

    this.readModel.reservedSeats.forEach((reservedSeats) => {
      reservedSeats.forEach(rs => {
        if (rs.reservationTime.getTime() < Timer.currentTime.getTime() - (12 * 60 * 1000)) {
          let cancelSeatReservation = new CancelSeatReservation(null, rs.screenId.value(), rs.row, rs.col)
          this.publish(cancelSeatReservation)
        }
      })
    })
  }
}