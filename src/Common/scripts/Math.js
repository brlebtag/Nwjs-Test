function constrain(value, minimum, maximum) {
  return Math.max(Math.min(value, maximum), minimum);
}

function map(value, begin1, end1, begin2, end2, constrained = true) {
  const newValue = (value - begin1) / (end1 - begin1) * (end2 - begin2) + begin2;

  if (!constrained) return newValue;

  return begin2 < end2
      ? constrain(newValue, begin2, end2)
      : constrain(newValue, end2, begin2);
}
