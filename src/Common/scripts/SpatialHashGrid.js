class SpatialHashGrid {

    constructor(bounds, dimentions) {
        this.bounds = bounds; // [[begin1, end1], [begin2, end2]]
        this.dimentions = dimentions; // [number_quadrants_width, number_quadrants_height]
        this.cells = [...Array(dimentions.width)].map(_ => [...Array(dimentions.height)].map(_ => (null)));
        this.queryIds = 0;
        
        // Create a pool for the nodes.
        this.pool = new ObjectPool(() => {
            return {
                next: null,
                previous: null,
                client: null,
            };
        });
    }

    newClient(position, dimention) {
        const client = {
            position: position,
            dimention: dimention,
            _cells: {
                min: null,
                max: null,
                nodes: null,
            },
            _queryId: -1,
        };

        this.insert(client);

        return client;
    }

    findNearby(position, bounds) {
        const { x, y } = position;
        const { width, height } = bounds;

        const minIndex = this.getCellIndex([x - width / 2, y - height / 2]); 
        const maxIndex = this.getCellIndex([x + width / 2, y + height / 2]);

        const clients = [];
        const queryIds = this.queryIds++;

        for (let x = minIndex[0], xn = maxIndex[0]; x <= xn; ++x) {
            for (let y = minIndex[1], yn = maxIndex[1]; y <= yn; ++y) {
                let head = this.cells[x][y];

                while (head) {
                    const v = head.client;
                    head = head.next;

                    if (v._queryId != queryIds) {
                        v._queryId = queryIds;
                        clients.push(v);
                    }
                }
            }
        }

        return clients;
    }

    UpdateClient(client) {
        const { x, y } = client.position;
        const { width, height } = client.dimention;

        const minIndex = this.getCellIndex([x - width / 2, y - height / 2]); 
        const maxIndex = this.getCellIndex([x + width / 2, y + height / 2]);

        if (client._cells.min[0] == minIndex[0] &&
            client._cells.min[1] == minIndex[1] && 
            client._cells.max[0] == maxIndex[0] && 
            client._cells.max[1] == maxIndex[1]) {
            return;
        }

        this.RemoveClient(client);
        this.insert(client);
    }

    RemoveClient(client) {
        const minIndex = client._cells.min;
        const maxIndex = client._cells.max;

        for (let x = minIndex[0], xn = maxIndex[0]; x <= xn; ++x) {
            for (let y = minIndex[1], yn = maxIndex[1]; y <= yn; ++y) {
                const xi = x - minIndex[0];
                const yi = y - minIndex[1];
                const node = client._cells.nodes[xi][yi];

                if (node.next) {
                    node.next.previous = node.previous;
                }

                if (node.previous) {
                    node.previous.next = node.next;
                }

                if (!node.previous) {
                    this.cells[x][y] = node.next;
                }

                this.pool.release(node);
            }
        }

        client._cells.min = null;
        client._cells.max = null;
        client._cells.nodes = null;
    }

    insert(client) {
        const { x, y } = client.position;
        const { width, height } = client.dimention;

        const minIndex = this.getCellIndex([x - width / 2, y - height / 2]); 
        const maxIndex = this.getCellIndex([x + width / 2, y + height / 2]);
        
        const nodes = [];

        for (let x = minIndex[0], xn = maxIndex[0]; x <= xn; ++x) {
            nodes.push([]);

            for (let y = minIndex[1], yn = maxIndex[1]; y <= yn; ++y) {
                const xi = x - minIndex[0];
                const head = this.pool.acquire();
                head.previous = head.next = null;
                head.client = client;               

                // It is a linked list of all elements in this same cell
                nodes[xi].push(head);

                head.next = this.cells[x][y];

                if (this.cells[x][y]) {
                    this.cells[x][y].previous = head;
                }

                this.cells[x][y] = head;
            }
        }

        client._cells.min = minIndex;
        client._cells.max = maxIndex;
        client._cells.nodes = nodes;
    }

    getCellIndex(position) {
        const { beginX, endX, beginY, endY } = this.bounds;
        const { width, height } = this.dimentions;

        const x = sat((position[0] - beginX) / (endX - beginX)); // area_from_begin_to_position / total_area (end - begin)
        const y = sat((position[1] - beginY) / (endY - beginY));

        // Above, it gives us a percentage. it is the approximate position related to the whole area but in percentage
        const xIndex = Math.floor(x * (width - 1)); // then, we multiply by number of quadrants we had split the whole area
        const yIndex = Math.floor(y * (height - 1));

        return [xIndex, yIndex];
    }
}
