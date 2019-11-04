export class EventRegistry {
  public occurenceDate : Date;
  public procedureId : symbol;
  public contextId : symbol;

  public constructor (procedureId : symbol, contextId : symbol) {
    this.contextId = contextId;
    this.procedureId = procedureId;
    this.occurenceDate = new Date(Date.now());
  }
};
