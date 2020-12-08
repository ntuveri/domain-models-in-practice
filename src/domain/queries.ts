import { Seat, ScreenId } from "./domain"

// Query
export interface Query { }

export class GetAvailableSeats implements Query {
  readonly screenId: string

  constructor(screenId: string) {
    this.screenId = screenId
  }
}


export interface QueryResponse {
}

// DTO
export class GetAvailableSeatsResponse implements QueryResponse {

  public availableSeats: Seat[]
  public screenId: ScreenId

  constructor(screenId: ScreenId, availableSeats: Seat[]) {
    this.screenId = screenId
    this.availableSeats = availableSeats
  }
}

