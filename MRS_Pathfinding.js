//=============================================================================
// Mythic Realms Studios- Core
// MRS_MovementManager.js
//=============================================================================

var Imported = Imported || {};
Imported.MRS_MovementManager = true;

var Mythic = Mythic || {};
Mythic.Pathfinder = Mythic.Pathfinder || {};
Mythic.Pathfinder.version = '1.0.0';

Mythic.Command = Mythic.Command || {};
Mythic.Core = Mythic.Core || {};
Mythic.Param = Mythic.Param || {};
Mythic.Utils = Mythic.Utils || {};

//=============================================================================
/*: 
* @plugindesc Creates and Modifies important parameters of the games base objects as well as adds additional functianality for easier development..
* @author Richard Guilliams
*
* @help 
* MRS plugins use a very specific tag format for processing tags and using them to incorporate important parameters into the game.
* because of this, tags use a special syntax.
* To enable proximity chasing for event. place <Proximity Chase><Proximity Chase Radius: 8><Proximity Chase Speed: 4.25> 
* 
* Version 1.00:
* - Finished plugin!
*/
//=============================================================================

//=============================================================================
// Plugin Command Processing
//=============================================================================

Mythic.Command.Pathfinder = function(arguments){
    target = {};
    if(arguments[0] === 'Player') target = $gamePlayer;
    GetCurrentEvent().createPathfinder();
    GetCurrentEvent().pathfinder.setTarget(target);
};

//=============================================================================
// Path Node
//=============================================================================
function PathNode(){
    this.initialize.apply(this, arguments);
}

PathNode.prototype.initialize = function(x, y){
    this.parentNodeIndex = 0;
    this.parentNode = {};
    this.currentDistance = 0;
    // this.baseNode = false;
    this.pathfinder = {};
    this.passable = false;
    this.x = x;
    this.y = y;
    this.leftNode = {};
    this.leftDistance = 0;
    this.leftActive = false;
    this.leftFailed = false;
    this.nodeOccupied = false;
    this.rightNode = {};
    this.rightDistance = 0;
    this.topNode = {};
    this.topDistance = 0;
    this.bottomNode = {};
    this.bottomDistance = 0;
    this.distances = [];
    // this.openList = [];
    // this.closedList = [];
    // this.coordsList = [];
};

PathNode.prototype.CurrentDistance = function(){
    return Mythic.Utils.DistanceBetweenCoords([this.x, this.y], [this.parent.target._x, this.parent.target._y]);
};

PathNode.prototype.getSiblingNodesSorted = function(){
    var siblingNodes = [this.leftNode, this.rightNode, this.topNode, this.bottomNode];
    return siblingNodes.sort((a, b) => a.CurrentDistance - b.CurrentDistance);
}

PathNode.prototype.setLeftDistance = function(){
    if(this.leftNode){
        this.leftDistance = Mythic.Utils.DistanceBetweenCoords([this.leftNode.x, this.leftNode.y], [this.parent.target._x, this.parent.target._y]);
    }
}

PathNode.prototype.setRightDistance = function(){
    if(this.rightNode){
        this.rightDistance = Mythic.Utils.DistanceBetweenCoords([this.rightNode.x, this.rightNode.y], [this.parent.target._x, this.parent.target._y]);
    }
}

PathNode.prototype.setTopDistance = function(){
    if(this.topNode){
        this.topDistance = Mythic.Utils.DistanceBetweenCoords([this.topNode.x, this.topNode.y], [this.parent.target._x, this.parent.target._y]);
    }
}

PathNode.prototype.setBottomDistance = function(){
    if(this.bottomNode){
        this.bottomDistance = Mythic.Utils.DistanceBetweenCoords([this.bottomNode.x, this.bottomNode.y], [this.parent.target._x, this.parent.target._y]);
    }
}


// PathNode.prototype.startSearch = function(){
//     this.parent.startingNode = this;
//     this.baseNode = true;
//     this.openList.push(this);
//     this.generateSearchList();
// };

// PathNode.prototype.targetNode = function(){
//     return this.parent.nodes.find(node => node.x === this.parent.targetX && node.y === this.parent.targetY);
// }

// PathNode.prototype.removeFromOpenList = function(node) {
//     const index = this.parent.startingNode.openList.indexOf(node);
//     if (index !== -1) {
//         this.parent.startingNode.openList.splice(index, 1);
//         this.parent.startingNode.closedList.push(node);
//     }
// };

// PathNode.prototype.generateSearchList = function(){
    //     const closedList = this.parent.startingNode.closedList;
//     const openList = this.parent.startingNode.openList;
//     if(openList.length > 0 && closedList.indexOf(this.parent.startingNode.targetNode == -1) && openList[0].constructor == PathNode){
//         openList[0].getSiblingNodesSorted().forEach(node => {
    //             if (node && node.constructor == PathNode && closedList.indexOf(node) == -1 && openList.indexOf(node) == -1) {
//                 node.parentNode = this;
//                 node.parentNodeIndex = closedList.length;
//                 openList.push(node);
//             }
//         });
//     }
//     this.removeFromOpenList(openList[0]);
//     if(closedList.indexOf(this.parent.startingNode.targetNode > -1) {
//         this.generateCoordsList();
//         this.baseNode = false;
//     }
// };

// PathNode.prototype.generateCoordsList = function(){
//     const startingNode = this.parent.startingNode;
//     const closedList = startingNode.closedList;
//     const index = closedList.indexOf(startingNode.targetNode; 
//     var coordsList = [];
//     closedList[index].createCoordList(coordsList);
//     this.coordsList = coordsList.reverse();;
//     console.log(this.coordsList);
// }

// PathNode.prototype.createCoordList = function(coordsList) {
    //     const visitedNodes = new Set(); // Keep track of visited nodes to avoid infinite loops
    
//     while (this && this.parentNodeIndex > 0 && !visitedNodes.has(this)) {
//         coordsList.push([this.x, this.y]);
//         visitedNodes.add(this);
//         currentNode = this.closedList[this.parentNodeIndex];
//     }
// };

PathNode.prototype.reset = function(){
    this.parentNode = {};
    this.parentNodeIndex = 0;
    // this.baseNode = false;
    // this.openList = [];
    // this.closedList = [];
    // this.coordsList = [];
};

PathNode.prototype.update = function(){
    this.setBottomDistance();
    this.setTopDistance();
    this.setLeftDistance();
    this.setRightDistance();
    this.distances = [this.leftNode, this.rightNode, this.topNode, this.bottomNode];
    if(this.baseNode) this.generateSearchList();
};

//=============================================================================
// Pathfinder
//=============================================================================


function Pathfinder(){
    this.initialize.apply(this, arguments);
}

Pathfinder.prototype.initialize = function(){
    this.event = GetCurrentEvent();
    this.startingNode = {};
    this.searchStarted = false;
    this.targetAcquired = false;
    this.target = {};
    this.target.x = 0;
    this.target.y = 0;
    this.distanceToTarget = 0;
    this.mapWidth = $gameMap.width();;
    this.mapHeight = $gameMap.height();;
    this.nodes = [];
    this.nodeBranches = [];
    this.openList = [];
    this.closedList = [];
    this.coordList = [];
    this.setup();
}

Pathfinder.prototype.setup = function(){
    this.parent = GetCurrentEvent();    
    this.createNodes();
    this.setupNodes();
}

//================================================================
// Pathfinder Target Setup
//================================================================

Pathfinder.prototype.setTarget = function(target){
    this.target = target;
    if(this.target) this.targetAcquired = true;
}

Pathfinder.prototype.distanceToTarget = function(){
}

//================================================================
// Pathfinder Node Setup
//================================================================

Pathfinder.prototype.setupNodes = function(){
    this.nodes.map((node) => {
        this.setupConnectedNodes(node);
    });
}

Pathfinder.prototype.setTargetNode = function(){
    this.targetNode = this.nodes.find(node => node.x === this.target.x && node.y === this.target.y);
}

Pathfinder.prototype.setupConnectedNodes = function(node){
    if($gameMap.isPassable(node.x, node.y, Game_Map.prototype.LEFT))    node.leftNode = this.nodes.find((el) => el.x === node.x - 1 && el.y === node.y);
    if($gameMap.isPassable(node.x, node.y, Game_Map.prototype.RIGHT))   node.rightNode = this.nodes.find((el) => el.x === node.x + 1 && el.y === node.y);
    if($gameMap.isPassable(node.x, node.y, Game_Map.prototype.UP))      node.topNode = this.nodes.find((el) => el.x === node.x && el.y === node.y - 1);
    if($gameMap.isPassable(node.x, node.y, Game_Map.prototype.DOWN))    node.bottomNode = this.nodes.find((el) => el.x === node.x && el.y === node.y + 1);
}

Pathfinder.prototype.createNodes = function(){
    this.nodes = [];
    for(i = 0; i < this.mapHeight; i++){
        for(j = 0; j < this.mapWidth; j++){
            if($gameMap.isTilePassable(j, i)){
                this.nodes.push(new PathNode(i, j));
                this.nodes[this.nodes.length - 1].parent = this;           
            }
        }
    }
}
PathNode.prototype.generateCoordsList = function(){ 
    var coordsList = [];
    this.createCoordList();
    this.coordsList = coordsList.reverse();
    console.log(this.coordsList);
}

Pathfinder.prototype.setStartingNode = function(){
    this.startingNode = this.nodes.find(node => node.x == this.event._x && node.y == this.event._y);
}

Pathfinder.prototype.resetNodes = function(){
    this.nodes.forEach( node => node.reset());
};

//================================================================
// Pathfinder Coords List
//================================================================

Pathfinder.prototype.createCoordList = function() {
    const visitedNodes = new Set(); // Keep track of visited nodes to avoid infinite loops
    
    while (this && this.parentNodeIndex > 0 && !visitedNodes.has(this)) {
        this.coordsList.push([this.x, this.y]);
        visitedNodes.add(this);
        currentNode = this.closedList[this.parentNodeIndex];
    }
};

Pathfinder.prototype.removeFromOpenList = function(node) {
    const index = this.openList.indexOf(node);
    if (index !== -1) {
        this.openList.splice(index, 1);
        this.closedList.push(node);
    }
};

Pathfinder.prototype.startSearch = function(){
    this.openList.push(this.startingNode);
    this.generateSearchList();
};

Pathfinder.prototype.targetFound = function() {
    return this.closedList.indexOf(this.targetNode);
}



//TODO Incorporate while loop here to ensure that the entire search takes place in a single run.
Pathfinder.prototype.generateSearchList = function(){
    debugger;
    while(this.openList.length > 0){

    }
    // Removed  && this.openList[0].constructor == PathNode from the if statement below
    if(this.openList.length > 0 && this.closedList.indexOf(this.targetNode) == -1){
        this.openList[0].getSiblingNodesSorted().forEach(node => {
            if (node && node.constructor == PathNode && this.closedList.indexOf(node) == -1 && this.openList.indexOf(node) == -1) {
                node.parentNode = this.startingNode;
                node.parentNodeIndex = this.closedList.length;
                this.openList.push(node);
            }
        });
    }
    this.removeFromOpenList(this.openList[0]);
    if(this.closedList.indexOf(this.targetNode) > -1) {
        this.generateCoordsList();
        this.baseNode = false;
    }
};
    
Pathfinder.prototype.shortestPathToTarget = function(){
    this.setStartingNode();
    this.startSearch();
}


Pathfinder.prototype.restart = function(){
    this.startingNode = {};
    this.targetX =      $gamePlayer._x;
    this.targetY =      $gamePlayer._y;
    this.x =            this.parent._x;
    this.y =            this.parent._y;
    this.setStartingNode();
    this.resetNodes();
    this.shortestPathToTarget();
};


Pathfinder.prototype.update = function(){
    if(this.nodes.length ==0) return this.restart();
    this.nodes.forEach( node => {
        node.update();
    })
    if(!this.searchStarted && this.targetAcquired) {
        this.searchStarted = true;
        this.shortestPathToTarget();
    }
}
//=============================================================================
// Game Event
//=============================================================================

Game_Event.prototype.createPathfinder = function(){
    this.pathfinder = new Pathfinder();
    this.pathfinder.x = this._x;
    this.pathfinder.y = this._y;
    this.pathfinder.targetX = $gamePlayer._x;
    this.pathfinder.targetY = $gamePlayer._y;
    this.pathfinder.parent = this;
};



Mythic.Pathfinder.GameEventUpdate = Game_Event.prototype.update;
Game_Event.prototype.update = function(){
    Mythic.Pathfinder.GameEventUpdate.call(this, arguments);
    if(this.pathfinder) this.pathfinder.update();
}

Mythic.Pathfinder.GameEventMoveTowardPlayer = Game_Event.prototype.moveTypeTowardPlayer;
Game_Event.prototype.moveTypeTowardPlayer = function() {
    Mythic.Pathfinder.GameEventMoveTowardPlayer.call(this);
    this.moveOnPath();
};

Game_Event.prototype.moveOnPath = function(){
    // this.pathfinder.shortestPathToTarget();
    const coords = this.pathfinder.coordsList
    if(!coords) return;
    var direction = this.coordsToMovementRoute(coords);
    if(coords.length != 0 && this._x === coords[0][0] && this._y === coords[0][1]){
        this.pathfinder.startingNode.coordsList = this.pathfinder.startingNode.coordsList.unshift();
    }
    this._moveRoute.list = [
        {code: direction, indent: 0}
    ]
    
}

//TODO Place in the Pathfinder.prototype
Game_Event.prototype.coordsToMovementRoute = function(coords){
    if(!coords || coords.length == 0) return
    let directionList = [this.getDirectionCode(this._x, this._y, coords[0][0], coords[0][1])];
    coords.forEach((el, i, arr) => {
        if(i === arr.length - 1) return;
        directionList.push(this.getDirectionCode(el[0], el[1], arr[i + 1][0], arr[i + 1][1]));
    });
    console.log(directionList);
}

//TODO Place in the Pathfinder.prototype
Game_Event.prototype.getDirectionCode = function(x1, y1, x2, y2){
    if(x1 == x2){
        if(y1 > y2){
            // up
            return 3
        }
        if(y1 < y2){
            return 1
        }
    }
    if(y1 == y2){
        if(x1 > x2){
            // up
            return 2
        }
        if(x1 < x2){
            return 4
        }
    }
}

//TODO Place in the Pathfinder.prototype
Game_Event.prototype.checkValidMove = function(){
    if(this.Directions.get(this._direction) === 'up') return
    if(this.Directions.get(this._direction) === 'right') return
    if(this.Directions.get(this._direction) === 'down') return
    if(this.Directions.get(this._direction) === 'left') return
}