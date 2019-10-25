import { getIdentifierOf, getStringFromSymbol } from '../utils/utils';
import { ContextBuilder } from './context-builder';
import { EventEmitter } from 'events';
import { Procedure } from '../procedure/procedure';
import { ProcedureType } from '../utils/types';

class CustomEmitter extends EventEmitter {};

export class Context extends ContextBuilder{
  private _emitter : CustomEmitter = new CustomEmitter;

  public get name() : string {
    return getStringFromSymbol(this._identifier);
  };

  public get identifier() : symbol {
    return this._identifier;
  }

  public getEmitter(identifier : symbol) : CustomEmitter {
    if (identifier === this.identifier) {
      return this._emitter;
    }
  }

  public publish(procedure : Procedure | symbol) : void {
    const procedureToBeEmitted : Procedure = (typeof procedure === 'symbol')?
      this._procedures.get(procedure) :
      procedure;

    this._emitter.emit(procedureToBeEmitted.identifier, procedureToBeEmitted);

    this._teardown();
  }

  private _teardown() : void {
    if (this._teardownStrategy === 'none') {
      return;
    }

    if (this._teardownStrategy === 'all') {
      this._procedures.forEach((procedure) => {
        this._emitter.removeAllListeners(procedure.identifier);
      });

      this._procedures = new Map();
      return;
    }

    this._filterOnceProcedures();
  }

  private _filterOnceProcedures() : void {
    this._procedures.forEach((procedure) => {
      if (procedure.type === 'once') this._emitter.removeAllListeners(procedure.identifier);
    });

    this._getProcedureListByType('once').forEach((procedure) => {
      this._procedures.delete(procedure.identifier);
    });
  }

  private _getProcedureListByType(type : ProcedureType) : Procedure[] {
    const list : Procedure[] = [];
    this._procedures.forEach((procedure) => {
      if (procedure.type === type) list.push(procedure);
    });

    return list;
  }

  public signProcedureByType(procedure : Procedure) : void {
    procedure.setContext(this);

    if (procedure.type === 'always') {
      this._emitter.on(procedure.identifier, procedure.Act);
      this._procedures.set(procedure.identifier, procedure);
      return;
    }

    this._emitter.once(procedure.identifier, procedure.Act);
    this._procedures.set(procedure.identifier, procedure);
    return;
  }

  public flush() : void {
    this._teardown();
  }

  public sign(procedure : Procedure[] | Procedure) : Context {
    if (Array.isArray(procedure)) {
      procedure.forEach((event) => {
        this.signProcedureByType(event);
      });
      return;
    }

    this.signProcedureByType(procedure);
    return this;
  }

  public resign(procedure : Procedure[] | Procedure | symbol[] | symbol) : Context {
    if (Array.isArray(procedure)) {
      procedure.forEach((event : symbol | Procedure) => {
        this._emitter.removeAllListeners(getIdentifierOf(event));
        this._procedures.delete(getIdentifierOf(event));
      });
      return;
    }

    this._procedures.delete(getIdentifierOf(procedure));
    return this;
  }

  public getProcedure(procedureId : symbol) : Procedure | undefined{
    return this._procedures.get(procedureId);
  }

  public hasProcedure(procedure : symbol | Procedure) : boolean {
    return this._procedures.has(getIdentifierOf(procedure));
  }

  // Add Actions to Procedures [By Symbol or By itself]
};
