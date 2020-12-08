import { Query, GetAvailableSeats, QueryResponse, GetAvailableSeatsResponse } from "../domain/queries"
import { AvailableSeatsByScreen } from "../domain/read_models"
import { ScreenId } from "../domain/domain"

// Query Handler
export interface QueryHandler {
  handleQuery(query: Query): void;
}


export class GetAvailableSeatsHandler implements QueryHandler {
  private readModel: AvailableSeatsByScreen
  private respond: (response: QueryResponse) => void

  constructor(readModel: AvailableSeatsByScreen, respond: (response: QueryResponse) => void) {
    this.readModel = readModel
    this.respond = respond
  }

  handleQuery(query: GetAvailableSeats): void {
    if (!(query instanceof GetAvailableSeats)) {
      return
    }

    const screenId = new ScreenId(query.screenId)
    const queryResponse = new GetAvailableSeatsResponse(screenId,
      this.readModel.availableSeats.get(screenId.value())!)

    this.respond(queryResponse)
  }
}