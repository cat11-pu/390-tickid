// tickrun.js：按处理预算处理并留账
import { segOf, nextOf, idOf } from "./tickid.js";

function fail(code, message) {
  const error = new Error(message);
  error.code = code;
  throw error;
}

function cloneState(state) {
  const source = state || {};
  return {
    ids: (source.ids || []).slice(),
    rolls: source.rolls || 0,
    seg: typeof source.seg === "number" ? source.seg : -1,
    seq: typeof source.seq === "number" ? source.seq : -1,
    tick: typeof source.tick === "number" ? source.tick : -1,
    ledger: (source.ledger || []).map(function (row) { return row.slice(); }),
    applied: (source.applied || []).slice()
  };
}

function validateEvent(spec, event) {
  if (!event || typeof event !== "object" || event.kind !== "take" || event.id === undefined) {
    fail(spec.event_error_code || "E_BAD_EVENT", "event is not a take");
  }
  if (!Number.isInteger(event.at) || event.at < 0) {
    fail(spec.bad_tick_code || "E_BAD_TICK", "tick is not a non-negative integer");
  }
}

function takeOne(spec, state, at) {
  const next = nextOf(state.seg, state.seq, at, spec.width, spec.seqMax);
  if (next[0] > spec.segMax) {
    fail(spec.seg_full_code || "E_SEG_FULL", "segment overflow");
  }
  state.seg = next[0];
  state.seq = next[1];
  if (next[2]) {
    state.rolls += 1;
  }
  state.tick = at;
  state.ids.push(idOf(state.seg, spec.machine, spec.machines, spec.seqMax, state.seq));
}

export function step(spec) {
  const state = cloneState(spec.state);
  const events = spec.events || [];
  const budget = typeof spec.budget === "number" ? spec.budget : 0;
  let served = 0;
  let judged = 0;
  for (const event of events) {
    const id = event && typeof event === "object" ? event.id : undefined;
    if (id !== undefined && state.applied.indexOf(id) !== -1) {
      continue;
    }
    validateEvent(spec, event);
    judged += 1;
    if (served >= budget) {
      state.ledger.push([event.kind, event.at]);
      state.applied.push(event.id);
      continue;
    }
    if (event.at < state.tick) {
      fail(spec.tick_back_code || "E_TICK_BACK", "tick went backward");
    }
    takeOne(spec, state, event.at);
    state.applied.push(event.id);
    served += 1;
  }
  return { state: state, served: served, ledger_before: state.ledger.length,
           ledger: state.ledger, judged: judged, judged_bound: events.length };
}

export function close(spec) {
  const state = cloneState(spec.state);
  const pending = state.ledger;
  state.ledger = [];
  let catchup = 0;
  for (const row of pending) {
    takeOne(spec, state, row[1]);
    catchup += 1;
  }
  return { state: state, catchup: catchup };
}
