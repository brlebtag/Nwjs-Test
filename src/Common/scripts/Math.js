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

function lowerBound(elements, value, cmp, args = [])  {
    let begin = 0, end = elements.length; // [begin, end)

    if (args.length > 0) {
        begin = args[0];
    }
    
    if (args.length > 1) {
        end = args[1]; // exclusive
    }

    let count = end - begin;

    while (count > 0) {
        let step = Math.floor(count / 2);
        let index = begin + step;

        if (cmp(elements[index], value) < 0) {
            begin = ++index;
            count -= step+1;
        } else {
            count = step;
        }
    }

    return begin;
}

function upperBound(elements, value, cmp, args = []) {
    let begin, end = elements.length; // [begin, end)

    if (args.length > 0) {
        begin = args[0];
    }
    
    if (args.length > 1) {
        end = args[1]; // exclusive
    }

    let count = end - begin;

    while (count > 0) {
        let step = Math.floor(count / 2);
        let index = begin + step;

        if (cmp(value, elements[index]) >= 0) {
            begin = ++index;
            count -= step+1;
        } else {
            count = step;
        }
    }

    return begin;
}

function binarySearch(elements, value, cmp, args = []) {
    let begin = 0, end = elements.length; // [begin, end)

    if (args.length > 0) {
        begin = args[0];
    }
    
    if (args.length > 1) {
        end = args[1]; // exclusive
    }

    begin = lowerBound(elements, value, cmp, args);

    return (begin != end && cmp(elements[begin], value) == 0);
}