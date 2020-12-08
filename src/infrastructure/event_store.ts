import { DomainEvent, ScreenScheduled, SeatReserved, SeatReservationRefused, SeatReservationCanceled } from "../domain/events"
import { ScreenId, CustomerId } from "../domain/domain"

export class EventStore {
  private events: DomainEvent[] = []

  store(events: DomainEvent[]): void {
    events.forEach(e => this.events.push(e))
  }

  byScreenId(screenId: ScreenId): DomainEvent[] {
    return this.events.filter(e =>
      (e instanceof ScreenScheduled && e.screenId.equals(screenId)) ||
      (e instanceof SeatReserved && e.screenId.equals(screenId)) ||
      (e instanceof SeatReservationRefused && e.screenId.equals(screenId)) || 
      (e instanceof SeatReservationCanceled && e.screenId.equals(screenId)))
  }

  byCustomerId(customerId: CustomerId): DomainEvent[] {
    return this.events.filter(e =>
      (e instanceof SeatReserved && e.customerId.equals(customerId)) ||
      (e instanceof SeatReservationRefused && e.customerId.equals(customerId)) ||
      (e instanceof SeatReservationCanceled && e.customerId && e.customerId.equals(customerId)))
  }

  ofType(constructor: String): DomainEvent[] {
    return this.events.filter(e => e.constructor.name === constructor)
  }
}
