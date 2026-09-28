import assert from "node:assert";
import { segOf, nextOf, idOf } from "../tickid.js";
import { step, close } from "../tickrun.js";
import { render } from "../app.js";

const base = {
  budget: 1, width: 10, machines: 4, machine: 2, seqMax: 3, segMax: 3,
  state: { ids: [], rolls: 0, seg: -1, seq: -1, tick: -1, ledger: [], applied: [] },
  events: [{ id: 1, kind: "take", at: 7 }],
  bad_tick_code: "E_BAD_TICK", tick_back_code: "E_TICK_BACK",
  seg_full_code: "E_SEG_FULL", event_error_code: "E_BAD_EVENT"
};

let failed = 0;
function check(name, fn) {
  try { fn(); console.log("ok " + name); } catch (e) { failed += 1; console.log("FAIL " + name + " :: " + e.message); }
}

check("segOf returns a number", () => {
  assert.strictEqual(typeof segOf(20, 10), "number");
});

check("nextOf returns a triple", () => {
  assert.strictEqual(nextOf(0, 0, 7, 10, 3).length, 3);
});

check("idOf returns a number", () => {
  assert.strictEqual(typeof idOf(0, 2, 4, 3, 1), "number");
});

check("step returns a state", () => {
  assert.strictEqual(typeof step(base).state, "object");
});

check("render counts events", () => {
  assert.strictEqual(typeof render(base).count_events, "number");
});

console.log("5 cases, " + failed + " failed");
process.exit(failed === 0 ? 0 : 1);
