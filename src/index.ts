import { Context } from './context/context';
import { Effect } from './utils/types';
import { EventManager } from './manager/manager';
import { Procedure } from './procedure/procedure';
import { toNewEffect } from './utils/utils';

const utils = {
  toNewEffect: toNewEffect
};

const birbsModule = {
  Context,
  Effect,
  EventManager,
  Procedure,
  utils
};

module.exports = birbsModule;
