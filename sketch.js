const nodes = [];
const connections = [];
const diameter = 30;
const max = 50;
const animationArr = [];

const addBtn = document.querySelector("#add");
const removeBtn = document.querySelector("#remove");
const connectBtn = document.querySelector("#connect");
const errorDiv = document.querySelector("#error");
const alertDiv = document.querySelector("#alert");
const dfsBtn = document.querySelector("#dfs");
const bfsBtn = document.querySelector("#bfs");
const dijkstraBtn = document.querySelector("#dijkstra");

function sleep(s) {
  return new Promise((res) => setTimeout(res, s * 1000));
}

function setup() {
  const canvas = createCanvas(600, 600);
  canvas.parent("sketch-holder");
}

function draw() {
  background(255);
  textAlign(CENTER, CENTER);
  for (let i in connections) {
    let nodeOne;
    let nodeTwo;
    for (let j in nodes) {
      if (nodes[j].n == connections[i][0]) {
        nodeOne = nodes[j];
      } else if (nodes[j].n == connections[i][1]) {
        nodeTwo = nodes[j];
      }
    }
    line(nodeOne.x, nodeOne.y, nodeTwo.x, nodeTwo.y);
  }
  for (let i in nodes) {
    nodes[i].show();
    if (nodes[i].drag) {
      nodes[i].move();
    }
  }
  if (animationArr.length) {
    alertDiv.innerHTML = animationArr[0]
      ? `다음 노드 : ${animationArr[0]}`
      : "";
    if (frameCount % 50 == 0) {
      const tarNode = animationArr.shift();
      for (let node of nodes) {
        if (node.n == tarNode) node.color = "rgb(0, 0, 255)";
        else node.color = "rgb(0, 0, 0)";
      }
    }
  } else if (frameCount % 50 == 0) {
    for (let node of nodes) {
      node.color = "rgb(0, 0, 0)";
    }
  }
}

class Node {
  constructor(x, y, n, idx) {
    this.x = x;
    this.y = y;
    this.n = n;
    this.idx = idx;
    this.color = "rgb(0, 0, 0)";
    this.drag = false;
    this.x_move = 0;
    this.y_move = 0;
  }
  click() {
    if (
      Math.abs(this.x - mouseX) <= diameter / 2 &&
      Math.abs(this.y - mouseY) <= diameter / 2
    ) {
      this.x_move = mouseX - this.x;
      this.y_move = mouseY - this.y;
      return true;
    }
    return false;
  }

  move() {
    this.x = mouseX - this.x_move;
    this.y = mouseY - this.y_move;
  }

  show() {
    stroke(this.color);
    strokeWeight(this.color == "rgb(0, 0, 0)" ? 1 : 3);
    circle(this.x, this.y, diameter);
    strokeWeight(1);
    stroke("rgb(0, 0, 0)");
    text(`${this.n}`, this.x, this.y);
  }
}

function mousePressed() {
  for (let i in nodes) {
    if (nodes[i].click()) {
      nodes[i].drag = true;
    }
  }
}

function mouseReleased() {
  for (let i in nodes) {
    nodes[i].drag = false;
  }
}

// 노드 추가
addBtn.addEventListener("click", async () => {
  if (nodes.length < max) {
    const x = [];
    const y = [];
    let randX = Math.floor(Math.random() * 541) + 30;
    let randY = Math.floor(Math.random() * 541) + 30;
    for (let i in nodes) {
      x.push(nodes[i].x);
      y.push(nodes[i].y);
    }
    while (x.filter((v) => v == randX).length != 0)
      randX = Math.floor(Math.random() * 541) + 30;
    while (y.filter((v) => v == randY).length != 0)
      randY = Math.floor(Math.random() * 541) + 30;

    nodes.push(
      new Node(
        randX,
        randY,
        nodes.length ? nodes[nodes.length - 1].n + 1 : 1,
        nodes.length
      )
    );
  } else {
    if (!errorDiv.innerHTML) {
      errorDiv.innerHTML = "최대 노드 개수 50개를 초과할 수 없습니다.";
      await sleep(2);
      errorDiv.innerHTML = "";
    }
  }
});

// 노드 삭제
removeBtn.addEventListener("click", () => {
  if (nodes.length) {
    const whatNode = prompt("삭제할 노드의 번호를 입력하세요.");
    if (nodes.filter((node) => node.n == Number(whatNode)).length == 1) {
      let idx = -1;
      for (let i in nodes) {
        if (nodes[i].n == Number(whatNode)) idx = nodes[i].idx;
      }
      for (let i = connections.length - 1; i >= 0; i--) {
        if (
          connections[i][0] == Number(whatNode) ||
          connections[i][1] == Number(whatNode)
        ) {
          connections.splice(i, 1);
        }
      }
      nodes.splice(idx, 1);
      for (let i in nodes) {
        nodes[i].idx = i;
      }
    } else alert("올바르지 않은 값입니다.");
  } else alert("존재하는 노드가 없습니다.");
});

// 노드 연결
connectBtn.addEventListener("click", () => {
  const nodeOne = prompt("연결할 첫번째 노드의 번호를 입력하세요.");
  const nodeTwo = prompt("연결할 두번째 노드의 번호를 입력하세요.");
  if (
    nodes.filter(
      (node) => node.n == Number(nodeOne) || node.n == Number(nodeTwo)
    ).length == 2
  ) {
    connections.push([Number(nodeOne), Number(nodeTwo)]);
  } else alert("올바르지 않은 값입니다.");
});

function createAdjacencyList() {
  const adjList = new Map();
  for (let node of nodes) {
    adjList.set(node.n, []);
  }
  for (let connection of connections) {
    adjList.get(connection[0]).push(connection[1]);
    adjList.get(connection[1]).push(connection[0]);
  }
  return adjList;
}

// DFS
dfsBtn.addEventListener("click", () => {
  const startNode = Number(prompt("DFS 시작 노드 번호를 입력하세요."));
  const adjList = createAdjacencyList();
  const visited = new Set();

  const tempAnimationArr = [];

  function dfs(node) {
    if (visited.has(node)) return;
    // console.log("DFS : ", node);
    visited.add(node);
    tempAnimationArr.push(node);

    for (let adjNode of adjList.get(node)) {
      if (visited.has(adjNode)) continue;
      dfs(adjNode);
    }
  }

  dfs(startNode);

  for (let i in tempAnimationArr) animationArr.push(tempAnimationArr[i]);
});

// BFS
bfsBtn.addEventListener("click", () => {
  const startNode = Number(prompt("BFS 시작 노드 번호를 입력하세요."));
  const adjList = createAdjacencyList();
  const visited = new Set();
  const queue = [startNode];

  const tempAnimationArr = [];

  while (queue.length > 0) {
    const node = queue.shift();
    if (visited.has(node)) continue;
    // console.log("BFS : ", node);
    visited.add(node);
    tempAnimationArr.push(node);
    for (let adjNode of adjList.get(node)) {
      if (!visited.has(adjNode)) queue.push(adjNode);
    }
  }

  for (let i in tempAnimationArr) animationArr.push(tempAnimationArr[i]);
});

// 다익스트라 알고리즘
dijkstraBtn.addEventListener("click", async () => {
  const startNode = Number(prompt("다익스트라 시작 노드 번호를 입력하세요."));
  const endNode = Number(prompt("다익스트라 목표 노드 번호를 입력하세요."));
  const adjList = createAdjacencyList();
  const distances = {};
  const pq = new PriorityQueue((a, b) => distances[a] < distances[b]);

  for (let node of nodes) {
    distances[node.n] = Infinity;
  }
  distances[startNode] = 0;
  pq.enqueue(startNode);

  while (!pq.isEmpty()) {
    const node = pq.dequeue();

    for (let neighbor of adjList.get(node)) {
      const newDist = distances[node] + 1; // 가중치 1로 설정
      if (newDist < distances[neighbor]) {
        distances[neighbor] = newDist;
        pq.enqueue(neighbor);
      }
    }
  }

  console.log(distances);
  alertDiv.innerHTML = `${startNode}번 노드에서 ${endNode}번까지 가는 최소 거리는 ${distances[endNode]}`;
  await sleep(3);
  alertDiv.innerHTML = "";
});

// 우선순위 큐
class PriorityQueue {
  constructor(comparator = (a, b) => a > b) {
    this.comparator = comparator;
    this.queue = [];
  }

  enqueue(item) {
    this.queue.push(item);
    this.queue.sort(this.comparator);
  }

  dequeue() {
    return this.queue.shift();
  }

  isEmpty() {
    return this.queue.length === 0;
  }
}
