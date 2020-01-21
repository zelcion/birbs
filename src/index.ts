import { Context } from './context/context';
import { EventManager } from './manager/manager';
import { Pipeline } from './procedure/pipeline';
import { Procedure } from './procedure/procedure';
import { toNewEffect } from './utils/utils';

const utils = {
  toNewEffect: toNewEffect
};

export default {
  Context,
  EventManager,
  Pipeline,
  Procedure,
  utils
};
