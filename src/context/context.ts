import { FlushingStrategies, ProcedureLifecycle } from '../utils/types';
import { getIdentifierOf, getStringFromSymbol } from '../utils/utils';
import { throwIfNoProcedureFound, throwNoProceduresRegistered } from '../utils/error-handler';
import { ContextBuilder } from './context-builder';
import { Procedure } from '../procedure/procedure';

export class Context extends ContextBuilder{
  public get flushingStrategy() : FlushingStrategies {
    return this._flushingStrategy;
  }

  public get identifierName() : string {
    return getStringFromSymbol(this._identifier);
  };

  public get identifier() : symbol {
    return this._identifier;
  }

  public trigger(procedure : Procedure | symbol) : void {
    throwNoProceduresRegistered(this._procedures);

    const procedureToBeEmitted : Procedure = (typeof procedure === 'symbol')?
      this._procedures.get(procedure) :
      procedure;

    throwIfNoProcedureFound(procedureToBeEmitted);
    this._emitter.emit(procedureToBeEmitted.identifier, this);

    this._teardown(procedureToBeEmitted);
  }

  private _teardown(procedure : Procedure) : void {
    if (procedure.lifecycle === 'ephemeral') this.resign(procedure);

    if (this._flushingStrategy === 'no-flush') {
      return;
    }

    if (this._flushingStrategy === 'each-publish') {
      this._clearEphemeralProcedures();
    }
  }

  private _clearEphemeralProcedures() : void {
    this._procedures.forEach((procedure) => {
      if (procedure.lifecycle === 'ephemeral') this._emitter.removeAllListeners(procedure.identifier);
    });

    this._getProcedureListByType('ephemeral').forEach((procedure) => {
      this._procedures.delete(procedure.identifier);
    });
  }

  private _getProcedureListByType(type : ProcedureLifecycle) : Procedure[] {
    const list : Procedure[] = [];
    this._procedures.forEach((procedure) => {
      if (procedure.lifecycle === type) list.push(procedure);
    });

    return list;
  }

  private _signProcedureByType(procedure : Procedure) : void {
    this._procedures.set(procedure.identifier, procedure);

    if (procedure.lifecycle === 'permanent') {
      this._emitter.on(procedure.identifier, procedure.Run);
      return;
    }

    this._emitter.once(procedure.identifier, procedure.Run);
    return;
  }

  public sign(procedure : Procedure[] | Procedure) : this {
    if (Array.isArray(procedure)) {
      procedure.forEach((event) => {
        this._signProcedureByType(event);
      });
      return;
    }

    this._signProcedureByType(procedure);
    return this;
  }

  public resign(procedure : Procedure[] | Procedure | symbol[] | symbol) : this {
    if (Array.isArray(procedure)) {
      procedure.forEach((event : symbol | Procedure) => {
        this._emitter.removeAllListeners(getIdentifierOf(event));
        this._procedures.delete(getIdentifierOf(event));
      });
      return;
    }

    this._emitter.removeAllListeners(getIdentifierOf(procedure));
    this._procedures.delete(getIdentifierOf(procedure));
    return this;
  }

  public getProcedure(procedureId : symbol) : Procedure | undefined {
    return this._procedures.get(procedureId);
  }

  public hasProcedure(procedure : symbol | Procedure) : boolean {
    return this._procedures.has(getIdentifierOf(procedure));
  }
};
