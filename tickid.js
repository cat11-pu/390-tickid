// tickid.js：段号、下一位与编号拼装
export function segOf(at, width) {
  return Math.floor(at / width);
}

export function nextOf(seg, seq, at, width, seqMax) {
  const target = segOf(at, width);
  if (seg < 0 || target > seg) {
    return [target, 0, 0];
  }
  if (seq + 1 > seqMax) {
    return [seg + 1, 0, 1];
  }
  return [seg, seq + 1, 0];
}

export function idOf(seg, machine, machines, seqMax, seq) {
  return (seg * machines + machine) * (seqMax + 1) + seq;
}
