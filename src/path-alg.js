const cmp = (p1, p2) => {
    if (p1[0] === p2[0] && p1[1] === p2[1]) return true;
    return false;
}

const nextLeftNeighbor = (rotation) => {
    if (cmp(rotation, [-1, -1])) return [-1, 0];
    if (cmp(rotation, [-1, 0])) return [-1, 1];
    if (cmp(rotation, [-1, 1])) return [0, 1];
    if (cmp(rotation, [0, 1])) return [1, 1];
    if (cmp(rotation, [1, 1])) return [1, 0];
    if (cmp(rotation, [1, 0])) return [1, -1];
    if (cmp(rotation, [1, -1])) return [0, -1];
    if (cmp(rotation, [0, -1])) return [-1, -1];
    console.log("ERROR: nextLeftNeighbor");
}

// Get all neighboring coordinates in order
const getAllNeighborsInOrder = (matrix, pos, prevPos = null) => {
    let neighbors = [];
    let rotation = [-1, -1];
    if (prevPos) {
        rotation = [prevPos[0] - pos[0], prevPos[1] - pos[1]];
    }
    // For the 8 neighbors, rotate and add them
    for (let i = 0; i < 8; i++) {
        // Rotate
        rotation = nextLeftNeighbor(rotation);
        neighbors.push([pos[0] + rotation[0], pos[1] + rotation[1]]);
    }
    // If there was a previous position, don't include it as a neighbor
    if (prevPos) {
        neighbors.pop();
    }
    return neighbors;
}

// Filter out all neighbors:
// only include inbounds neighbors and where a 1 is present
const findNeighborsInOrder = (matrix, pos, prevPos) => {
    let realNeighbors = [];
    let max_y = matrix.length - 1;
    let max_x = matrix[0].length - 1;
    let neighbors = getAllNeighborsInOrder(matrix, pos, prevPos);
    
    for (let i = 0; i < neighbors.length; i++) {
        if (neighbors[i][0] >= 0 && neighbors[i][0] <= max_y &&
            neighbors[i][1] >= 0 && neighbors[i][1] <= max_x &&
            matrix[neighbors[i][0]][neighbors[i][1]] === 1) {
            realNeighbors.push(neighbors[i]);
            }
    }
    return realNeighbors;
}

const createEmptyMatrix = (rows, columns) => {
    let matrix = Array(rows);
    for (let i = 0; i < rows; i++) {
        matrix[i] = Array(columns);
        for (let j = 0; j < columns; j++) {
            matrix[i][j] = 0;
        }
    }
    return matrix;
}

const clearMatrix = (matrix) => {
    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[0].length; j++) {
            matrix[i][j] = 0;
        }
    }
}

const findPaths = (matrix, startPos) => {
    let visited = createEmptyMatrix(matrix.length, matrix[0].length);
    let queues = Array(0);

    function searchNext(prevPos, pos) {
        // If reached the starting position (found path)
        if (cmp(pos, startPos)) {
            return Array(pos);
        }
        // If we have been visited already, also return
        if (visited[pos[0]][pos[1]] === 1) {
            return null;
        }
        // Otherwise, add ourselves to the queue, and mark as visited
        visited[pos[0]][pos[1]] = 1;
        // Search for a path from each neighbor
        let neighbors = findNeighborsInOrder(matrix, pos, prevPos);
        for (let i = 0; i < neighbors.length; i++) {
            let neighbor = neighbors[i];
            let queue = searchNext(pos, neighbor);
            if (queue != null) {
                queue.push(pos);
                return queue;
            }
        }
        return null;
    }

    matrix[startPos[0]][startPos[1]] = 1;
    // Search new paths formed
    let neighbors = findNeighborsInOrder(matrix, startPos, null);
    // find path formed by each neighbor
    for (let i = 0; i < neighbors.length; i++) {
        clearMatrix(visited);
        let queue = searchNext(startPos, neighbors[i]);
        if (queue) {
            queue.push(startPos)
            queues.push(queue);
        }
        queue = null;
    }
    return queues;
}

const fillMatrix = (matrix) => {
    const swap0and1 = (num) => {
        if (num === 0) {
            return 1;
        }
        return 0;
    }
    let queue = [[0, 0]];
    // v = visited
    let v = createEmptyMatrix(matrix.length + 2, matrix[0].length + 2);
    // Recreate original matrix padded with empty layer (m)
    let m = createEmptyMatrix(matrix.length + 2, matrix[0].length + 2);
    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[0].length; j++) {
            m[i + 1][j + 1] = matrix[i][j];
        }
    }
    
    let xMax = v[0].length;
    let yMax = v.length;
    // Propogate and fill
    while (queue.length > 0) {
        // console.log("a");
        // c is current dot
        let c = queue.pop();
        // console.log("c:", c);
        // console.log("m:", m);
        // console.log("v:", v);
        // Set current dot as visited
        v[c[0]][c[1]] = 1;
        // If up
        if (c[0] > 0 && v[c[0] - 1][c[1]] === 0 && m[c[0] - 1][c[1]] === 0) {
            queue.push([c[0] - 1, c[1]]);
            // console.log("up");
        }
        // If right
        if (c[1] < xMax - 1 && v[c[0]][c[1] + 1] === 0 && m[c[0]][c[1] + 1] === 0) {
            queue.push([c[0], c[1] + 1]);
            // console.log("right");
        }
        // If down
        if (c[0] < yMax - 1 && v[c[0] + 1][c[1]] === 0 && m[c[0] + 1][c[1]] === 0) {
            queue.push([c[0] + 1, c[1]]);
            // console.log("down");
        }
        // If left
        if (c[1] > 0 && v[c[0]][c[1] - 1] === 0 && m[c[0]][c[1] - 1] === 0) {
            queue.push([c[0], c[1] - 1]);
            // console.log("left");
        }
    }
    // Convert visited matrix to normal matrix
    let retMatrix = createEmptyMatrix(matrix.length, matrix[0].length);
    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[0].length; j++) {
            retMatrix[i][j] = swap0and1(v[i + 1][j + 1]);
        }
    }
    return retMatrix;
}

const createPathMatrix = (matrix, startPos) => {
    let visited = createEmptyMatrix(matrix.length, matrix[0].length);
    let pathMatrix = createEmptyMatrix(matrix.length, matrix[0].length);
    let pathExists = false;

    function searchNext(prevPos, pos) {
        // If reached the starting position (found path)
        if (cmp(pos, startPos)) {
            pathMatrix[pos[0]][pos[1]] = 1;
            pathExists = true;
            return true;
        }
        // If we have been visited already, also return
        if (visited[pos[0]][pos[1]] === 1) {
            return false;
        }
        // Otherwise, add ourselves to the queue, and mark as visited
        visited[pos[0]][pos[1]] = 1;
        // Search for a path from each neighbor
        let neighbors = findNeighborsInOrder(matrix, pos, prevPos);
        for (let i = 0; i < neighbors.length; i++) {
            let neighbor = neighbors[i];
            let pathFound = searchNext(pos, neighbor);
            if (pathFound) {
                pathMatrix[pos[0]][pos[1]] = 1;
                return true;
            }
        }
        return false;
    }

    matrix[startPos[0]][startPos[1]] = 1;
    // Search new paths formed
    let neighbors = findNeighborsInOrder(matrix, startPos, null);
    // find path formed by each neighbor
    for (let i = 0; i < neighbors.length; i++) {
        clearMatrix(visited);
        searchNext(startPos, neighbors[i]);
    }
    // If there's no path
    if (!pathExists) {
        return null;
    }
    return fillMatrix(pathMatrix);
}

const findPathAndMatrix = (matrix, startPos) => {
    // Get the paths
    let paths = findPaths(matrix, startPos);
    // Find the upper-left most dot
    let upperLeft = null;
}


module.exports = { findPaths, createPathMatrix };

