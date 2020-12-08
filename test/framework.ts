import { expect } from "chai";
import { DomainEvent } from "../src/domain/events";
import { Command } from "../src/domain/commands";
import { CommandHandler, ReserveSeatHandler, CancelSeatReservationHandler } from "../src/infrastructure/command_handlers";
import { QueryHandler, GetAvailableSeatsHandler } from "../src/infrastructure/query_handlers";
import { EventStore } from "../src/infrastructure/event_store";
import { ReadModel, AvailableSeatsByScreen, ReservedSeatsByScreen } from "../src/domain/read_models";
import { Query, QueryResponse } from "../src/domain/queries";
import { Policy, SeatReservationExpiredPolicy } from "../src/domain/policies";

export interface Framework {
  readonly given: (events: DomainEvent[]) => void;
  readonly when: (command: Command) => void
  readonly whenQuery: (query: Query) => void
  readonly whenEvent: (event: DomainEvent) => void
  readonly thenExpect: (events: DomainEvent[]) => void
  readonly thenExpectResponse: (responses: QueryResponse[]) => void
  readonly thenExpectTrigger: (commands: Command[]) => void
}

export class FrameworkFactory {

  static createFramework() : Framework {

    const eventStore: EventStore = new EventStore()
    let readModels: ReadModel[] = []
    let commandHandlers: CommandHandler[] = []
    let queryHandlers: QueryHandler[] = []
    let policies: Policy[] = []
    const queryResponses: QueryResponse[] = []
    const publishedEvents: DomainEvent[] = []
    const publishedCommands: Command[] = []

    const eventBus = (event: DomainEvent) => {
      publishedEvents.push(event)
      readModels.forEach(rm => rm.project(event))
    }

    const commandBus = (command: Command) => {
      publishedCommands.push(command)
      commandHandlers.forEach(ch => ch.handleCommand(command))
    }

    return {  

      given(events: DomainEvent[]): void {
        eventStore.store(events)
        readModels = [
          new AvailableSeatsByScreen(events), 
          new ReservedSeatsByScreen(events)
        ]
      },

      when(command: Command): void {
        commandHandlers = [
          new ReserveSeatHandler(eventStore, eventBus), 
          new CancelSeatReservationHandler(eventStore, eventBus)
        ]
        commandHandlers.forEach(h => h.handleCommand(command))
      },

      whenQuery(query: Query): void {
        queryHandlers = [
          new GetAvailableSeatsHandler(readModels[0] as AvailableSeatsByScreen, (response) => { queryResponses.push(response) })
        ]
        queryHandlers.forEach(h => h.handleQuery(query))
      },

      whenEvent(event: DomainEvent): void {
        policies = [
          new SeatReservationExpiredPolicy(readModels[1] as ReservedSeatsByScreen, commandBus)
        ]
        policies.forEach(h => h.handleEvent(event))
      },
      
      thenExpect(events: DomainEvent[]) {
        publishedEvents.forEach((publishedEvent, idx) => {
          expect(publishedEvent.constructor).to.be.eql(events[idx].constructor)  
          expect(publishedEvent).to.be.eql(events[idx])    
        })
      },

      thenExpectResponse(responses: QueryResponse[]) {      
        queryResponses.forEach((queryResponse, idx) => {
          expect(queryResponse.constructor).to.be.eql(responses[idx].constructor)
          expect(queryResponse).to.be.eql(responses[idx])
        })
      },

      thenExpectTrigger(commands: Command[]) {
        publishedCommands.forEach((command, idx) => {
          expect(command.constructor).to.be.eql(commands[idx].constructor)
          expect(command).to.be.eql(commands[idx])
        })
      }
    }
  }
}