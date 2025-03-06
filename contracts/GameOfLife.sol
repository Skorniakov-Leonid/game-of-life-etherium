// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract GameOfLife {
    struct Cell {
        int256 x;
        int256 y;
    }

    mapping(int256 => mapping(int256 => bool)) public grid;
    Cell[] public activeCells;

    function setCell(int256 x, int256 y, bool alive) public {
        grid[x][y] = alive;
        if (alive) {
            activeCells.push(Cell(x, y));
        } else {
            _removeCell(x, y);
        }
    }

    function nextGeneration() public {
        Cell[] memory candidates = _gatherCandidates();
        Cell[] memory newActiveCells = new Cell[](candidates.length);
        uint256 newActiveCount = 0;

        for (uint256 i = 0; i < candidates.length; i++) {
            int256 x = candidates[i].x;
            int256 y = candidates[i].y;
            uint8 neighbors = countAliveNeighbors(x, y);

            if (grid[x][y]) {
                if (neighbors == 2 || neighbors == 3) {
                    newActiveCells[newActiveCount++] = Cell(x, y);
                }
            } else if (neighbors == 3) {
                newActiveCells[newActiveCount++] = Cell(x, y);
            }
        }

        for (uint256 i = 0; i < activeCells.length; i++) {
            int256 x = activeCells[i].x;
            int256 y = activeCells[i].y;
            grid[x][y] = false;
        }
        delete activeCells;

        for (uint256 i = 0; i < newActiveCount; i++) {
            int256 x = newActiveCells[i].x;
            int256 y = newActiveCells[i].y;

            if (!grid[x][y]) {
                activeCells.push(newActiveCells[i]);
                grid[x][y] = true;
            }

        }
    }

    function _gatherCandidates() internal view returns (Cell[] memory) {
        uint256 maxCandidates = activeCells.length * 9;
        Cell[] memory candidates = new Cell[](maxCandidates);
        uint256 count = 0;

        for (uint256 i = 0; i < activeCells.length; i++) {
            int256 x = activeCells[i].x;
            int256 y = activeCells[i].y;

            for (int8 dx = - 1; dx <= 1; dx++) {
                for (int8 dy = - 1; dy <= 1; dy++) {
                    candidates[count++] = Cell(x + dx, y + dy);
                }
            }
        }
        return candidates;
    }

    function countAliveNeighbors(int256 x, int256 y) internal view returns (uint8 count) {
        for (int8 dx = - 1; dx <= 1; dx++) {
            for (int8 dy = - 1; dy <= 1; dy++) {
                if (dx == 0 && dy == 0) continue;
                if (grid[x + dx][y + dy]) count++;
            }
        }
    }

    function _removeCell(int256 x, int256 y) internal {
        for (uint256 i = 0; i < activeCells.length; i++) {
            if (activeCells[i].x == x && activeCells[i].y == y) {
                activeCells[i] = activeCells[activeCells.length - 1];
                activeCells.pop();
                break;
            }
        }
    }

    function isAlive(int256 x, int256 y) public view returns (bool) {
        return grid[x][y];
    }

    function getActiveCells() public view returns (Cell[] memory) {
        return activeCells;
    }
}
