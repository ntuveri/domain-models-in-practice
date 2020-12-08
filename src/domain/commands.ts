import { Col, Row } from "./domain"

// Command
export interface Command { }

export class ReserveSeat implements Command {
  readonly customerId: string
  readonly screenId: string
  readonly row: Row
  readonly col: Col

  constructor(customerId: string, screenId: string, row: Row, col: Col) {
    this.customerId = customerId
    this.screenId = screenId
    this.row = row
    this.col = col
  }
}

export class CancelSeatReservation implements Command {
  readonly customerId: string | null
  readonly screenId: string
  readonly row: Row
  readonly col: Col

  constructor(customerId: string | null, screenId: string, row: Row, col: Col) {
    this.customerId = customerId
    this.screenId = screenId
    this.row = row
    this.col = col
  }
}