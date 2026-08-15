export enum EventType {
  SINGLES = 1,
  TEAMS = 5,
}


export class EventTypeHelper {
  static fromNumber(value: number): EventType {
    if (!(value in EventType)) {
      throw new Error(`Invalid EventType: ${value}`);
    }
    return value;
  }

  static toNumber(type: EventType): number {
    return type;
  }

  static toString(type: EventType): string {
    return EventType[type];
  }
}
