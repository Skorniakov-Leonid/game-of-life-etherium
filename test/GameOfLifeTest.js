const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("GameOfLife", function () {
  let GameOfLife, game, owner, addr1;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();
    GameOfLife = await ethers.getContractFactory("GameOfLife");
    game = await GameOfLife.deploy();
    await game.waitForDeployment();
  });

  it("Should deploy successfully", async function () {
    expect(await game.activeCells.length).to.equal(0);
  });

  it("Should set a cell alive", async function () {
    await game.setCell(1, 1, true);
    expect(await game.grid(1, 1)).to.equal(true);
  });

  it("Should kill a cell", async function () {
    await game.setCell(1, 1, true);
    expect(await game.grid(1, 1)).to.equal(true);
    await game.setCell(1, 1, false);
    expect(await game.grid(1, 1)).to.equal(false);
  });

  it("Should add alive cell to activeCells", async function () {
    await game.setCell(2, 2, true);
    const cell = await game.activeCells(0);
    expect(cell.x).to.equal(2);
    expect(cell.y).to.equal(2);
  });

  it("Should remove dead cell from activeCells", async function () {
    await game.setCell(2, 2, true);
    await game.setCell(2, 2, false);
    await expect(game.activeCells(0)).to.be.reverted; // Нет клеток
  });

  it("Should calculate next generation with no cells", async function () {
    await game.nextGeneration();
    expect(await game.activeCells.length).to.equal(0);
  });

  it("Should make a dead cell alive with exactly 3 neighbors", async function () {
    await game.setCell(0, 1, true);
    await game.setCell(1, 0, true);
    await game.setCell(1, 2, true);

    await game.nextGeneration();

    expect(await game.grid(1, 1)).to.equal(true); // Новая живая клетка
  });

  it("Should keep an alive cell with 2 neighbors", async function () {
    await game.setCell(1, 1, true);
    await game.setCell(0, 1, true);
    await game.setCell(1, 0, true);

    await game.nextGeneration();

    expect(await game.grid(1, 1)).to.equal(true); // Выживает
  });

  it("Should kill an alive cell with 1 neighbor", async function () {
    await game.setCell(1, 1, true);
    await game.setCell(0, 1, true);

    await game.nextGeneration();

    expect(await game.grid(1, 1)).to.equal(false); // Умирает от одиночества
  });

  it("Should kill an alive cell with more than 3 neighbors", async function () {
    await game.setCell(1, 1, true);
    await game.setCell(0, 1, true);
    await game.setCell(1, 0, true);
    await game.setCell(1, 2, true);
    await game.setCell(2, 1, true);

    await game.nextGeneration();

    expect(await game.grid(1, 1)).to.equal(false); // Умирает от перенаселения
  });

  it("Should handle negative coordinates", async function () {
    await game.setCell(-1, -1, true);
    expect(await game.grid(-1, -1)).to.equal(true);
  });

  it("Should keep track of active cells n", async function () {
    await game.setCell(0, 1, true);
    await game.setCell(1, 0, true);
    await game.setCell(1, 2, true);

    const activeCells = await game.getActiveCells();
    const activeCount = activeCells.length;
    expect(activeCount).to.equal(3);
  });

  it("Should keep track of active cells after generation", async function () {
    await game.setCell(1, 1, true);
    await game.setCell(2, 0, true);
    await game.setCell(0, 0, true);

    await game.nextGeneration();

    const activeCells = await game.getActiveCells();
    const activeCount = activeCells.length;
    expect(activeCount).to.equal(2);
  });
});
