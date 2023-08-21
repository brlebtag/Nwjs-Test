class CircularArray {
    constructor(capacity, elements) {
        this._storage = new Array(capacity);
        this._capacity = capacity;
        this._begin = this._end = this._total = 0;

        if (elements) {
            if (elements.length > capacity) {
                throw new Error("Capacity must be bigger than or equal to elements array size.");
            }

            let len = elements.length;
            const storage = this._storage;
            for (let i = 0; i < len; i++) {
                storage[i] = elements[i];
            }
            this._total = elements.length;
            this._end = elements.length % this._capacity;
        }
    }

    reset() {
        this._total = this._begin = this._end = 0;
    }

    clear() {
        this._storage.fill(undefined);
    }

    skipFront(num) {
        num = Math.min(num, this._total);
        if (num <= 0) return;
        const storage = this._storage;
        const capacity = this._capacity;
        let i, n;
        for (i = this._begin, n = 0; n < num; (i = (i + 1) % capacity), n++) {
            storage[i] = undefined;
        }
        this._total -= num;
        this._begin = i;
    }

    skipBack(num) {
        num = Math.min(num, this._total);
        if (num <= 0) return;
        const storage = this._storage;
        const capacity = this._capacity;
        let n, i = this._end - 1;
        if (i < 0) {
            i = capacity - 1;
        }
        for (n = 0; n < num; n++) {
            storage[i] = undefined;
            i = i - 1;
            if (i < 0) {
                i = capacity - 1;
            }
        }
        this._total -= num;
        this._end = i;
    }

    set(index, value) {
        const capacity = this._capacity;
        index += this._begin;
        if (index >= 0) {
            this._storage[index % capacity] = value; // shift right
            return;
        }
        let newIndex = capacity - ((-index) % capacity); // shift to left
        this._storage[newIndex === capacity ? 0 : newIndex] = value;
    }

    front() {
        if (this._total === 0) return undefined; // empty
        return this._storage[this._begin];
    }

    back() {
        if (this._total === 0) return undefined; // empty
        let index = this._end - 1;
        if (index < 0) {
            index = this._capacity - 1;
        }
        return this._storage[index];
    }

    // insert at the end
    push(value) {
        const capacity = this._capacity;
        const end = this._end;
        this._storage[end] = value;
        this._end = (end + 1) % capacity;
        this._total++;
        if (this._total >= capacity) {
            this._begin = (this._begin + 1) % capacity;
            this._total = capacity;
        }
    }

    // insert at the beginning
    unshift(value) {
        const capacity = this._capacity;
        this._begin--;
        if (this._begin < 0) {
            this._begin = this._capacity - 1; // go to the end
        }
        this._storage[this._begin] = value;
        this._total++;
        if (this._total >= capacity) {
            this._end--;
            this._total = capacity;
            if (this._end < 0) {
                this._end = capacity - 1;
            }
        }
    }
    
    // remove at the end
    pop() {
        const capacity = this._capacity;
        this._end--;
        if (this._end < 0) {
            this._end = capacity - 1;
        }
        let el = this._storage[this._end];
        this._storage[this._end] = undefined; // empty the slot
        this._total--;
        return el;
    }

    // remove at the beginning
    shift() {
        const capacity = this._capacity;
        let el = this._storage[this._begin];
        this._storage[this._begin] = undefined; // empty the slot
        this._begin = (this._begin + 1) % capacity;
        this._total--;
        return el;
    }

    at(index) {
        const capacity = this._capacity;
        index += this._begin;
        if (index >= 0) return this._storage[index % capacity]; // shift right
        let newIndex = capacity - ((-index) % capacity); // shift to left
        return this._storage[newIndex === capacity ? 0 : newIndex];
    }

    get(index) {
        return this._storage[index];
    }

    get length() {
        return this._total;
    }
    
    get capacity() {
        return this._capacity;
    }

    full() {
        return this._total === this._capacity;
    }

    empty() {
        return this._total === 0;
    }

    get begin() {
        return this._begin;
    }
    
    get end() {
        return this._end;
    }
}
