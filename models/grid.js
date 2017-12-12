var neo4j = require('neo4j');
var db = new neo4j.GraphDatabase(
    process.env['NEO4J_URL'] ||
    process.env['GRAPHENEDB_URL'] ||
    'http://localhost:7474'
);
var bcrypt = require('bcrypt-nodejs');
var async = require('async');


// private constructor:
var Grid = module.exports = function Grid(_node) {
    // all we'll really store is the node; the rest of our properties will be
    // derivable or just pass-through properties (see below).
    this._node = _node;
}

Grid.get = function (id, callback) {
    var qp = {
        query: [
            'MATCH (grid:Grid)',
            'WHERE ID(grid) = {gridId}',
            'RETURN grid',
        ].join('\n'),
        params: {
            gridId: parseInt(id)
        }
    }

    db.cypher(qp, function (err, result) {
        if (err) return callback(err);
        callback(null, result[0]['grid']);
    });
};


Grid.getBy = function (field, value, callback) {
    var qp = {
        query: [
            'MATCH (grid:Grid)',
            'WHERE ' + field + ' = {value}',
            'RETURN grid',
        ].join('\n'),
        params: {
            value: value
        }
    }

    db.cypher(qp, function (err, result) {
        if (err) return callback(err);
        if (!result[0]) {
            callback(null, null);
        } else {
            callback(null, result);
        }
    });
}

Grid.loadGrid = function (gridName, callback) {
    var qp = {
        query: [
            'MATCH (grid:Grid),(node:Node)-[r]-()',
            'MATCH (grid)-[rel:has]->(node)',
            'WHERE grid.name = {gridName}',
            'RETURN r, node'
        ].join('\n'),
        params: {
            gridName: gridName,
        }
    }
    
    db.cypher(qp, function (err, results) {
        if (err) return callback(err);
        callback(null, results);
    });

}

Grid.deleteNode = function (nodeLabel, gridName, callback) {
    var qp = {
        query: [
            'MATCH (grid:Grid),(node:Node)-[r]-() MATCH (grid)-[rel:has]->(node) WHERE grid.name = {gridName}',
            'AND node.label = {nodeLabel}',
            'DETACH DELETE node',
            'RETURN grid, rel'
        ].join('\n'),
        params: {
            nodeLabel: nodeLabel,
            gridName: gridName
        }
    }

    console.log(qp);
    // MATCH (user:User),(grid:Grid) MATCH (user)-[rel:creates]->(grid) WHERE ID(user) = 2 RETURN grid 
    db.cypher(qp, function (err, results) {
        if (err) return callback(err);
        callback(null, results);
    });
}

Grid.loadHeaderNodes = function (userId, callback) {
    var qp = {
        query: [
            'MATCH (user:User),(grid:Grid)',
            'MATCH (user)-[rel:creates]->(grid)',
            'WHERE ID(user) = {userId}',
            'RETURN grid'
        ].join('\n'),
        params: {
            userId: userId,
        }
    }
    // MATCH (user:User),(grid:Grid) MATCH (user)-[rel:creates]->(grid) WHERE ID(user) = 2 RETURN grid 
    db.cypher(qp, function (err, results) {
        if (err) return callback(err);
        callback(null, results);
    });

}


Grid.deleteExistingGraph = function (gridName, callback) {

    var qp = {
        query: [
            'MATCH (grid:Grid { name: {name} })-[r:has]->(m)',
            'DETACH DELETE grid',
            'DETACH DELETE m',
        ].join('\n'),
        params: {
            name: gridName
        }
    }
    db.cypher(qp, function (err, results) {
        if (err) return callback(err);
        callback(null);
    });

}
// creates the grid and persists (saves) it to the db, incl. indexing it:
Grid.createGraph = function (grid, headerNodeId, cb) {
    /**
     * We now iterate through all nodes, the first one we add a relationship with the previous one created.
     * MERGE (p:Person{ first: { map }.name, last: { map }.last }
       ON CREATE SET n = { map }
       ON MATCH  SET n += { map }
     */
    var graphToReturn = { result: true, nodes: [] };
    console.log('createGraph', grid);
    async.each(grid.nodes, function (data, callback) {

        var qp = {
            query: [
                'CREATE (node:Node {data})',
                'RETURN node',
            ].join('\n'),
            params: {
                data: data
            }
        }
        db.cypher(qp, function (err, results) {
            if (err) {
                graphToReturn.result = false;
                callback(err);
            }
            graphToReturn.nodes.push(results[0].node.properties);

            var qp = {
                query: [
                    'MATCH (node:Node),(grid:Grid)',
                    'WHERE ID(node) = {nodeId} AND ID(grid) = {headerNodeId}',
                    'MERGE (grid)-[rel:has]->(node)',
                    'ON CREATE SET rel.timestamp = timestamp()',
                    'RETURN rel'
                ].join('\n'),
                params: {
                    nodeId: results[0]['node']._id,
                    headerNodeId: headerNodeId,
                }
            }
            db.cypher(qp, function (err, result) {
                if (err) {

                    callback(err);
                }
                callback();
            });


        });

    }, function (err) {
        // if any of the file processing produced an error, err would equal that error
        if (err) {
            // One of the iterations produced an error.
            // All processing will now stop.
            console.log('A node failed to being processed');
            graphToReturn.result = false;
        } else {
            console.log('All nodes were created and related to the header node');
        }
        cb(graphToReturn);
    });

};

Grid.createGraphEdges = function (grid, cb) {
    /**
     * We now iterate through all nodes, the first one we add a relationship with the previous one created.
     * MERGE (p:Person{ first: { map }.name, last: { map }.last }
       ON CREATE SET n = { map }
       ON MATCH  SET n += { map }
     */
    console.log('Here create edges');
    var graphToReturn = { result: true, edges: [] };
    async.each(grid.edges, function (edge, callback) {
        var qp = {
            query: [
                'MATCH (objective:Node),(strategy:Node)',
                'WHERE objective.id = {source} AND strategy.id = {target}',
                'MERGE (objective)-[rel:uses]->(strategy)',
                'ON CREATE SET rel.id = {id}, rel.source = {source}, rel.target = {target}, rel.size = {size}, rel.color = {color}, rel.type = {type}',
                'RETURN rel'
            ].join('\n'),
            params: {
                source: edge.source,
                target: edge.target,
                id: edge.id,
                size: edge.size,
                color: edge.color,
                type: edge.type

            }
        }
        db.cypher(qp, function (err, result) {


            if (err) {
                console.log('err in edges', err);
                callback(err)
            }

            //graphToReturn.edges.push();
            graphToReturn.edges.push(result[0].rel.properties);
            callback();
        });

    }, function (err) {
        // if any of the file processing produced an error, err would equal that error
        if (err) {
            // One of the iterations produced an error.
            // All processing will now stop.
            console.log('An Edge failed to being processed');
            graphToReturn.result = false;
        } else {
            console.log('All edges were created and related to the header node');
        }
        cb(graphToReturn);
    });
};


Grid.create = function (name, userId, callback) {
    var qp = {
        query: [
            'MERGE (grid:Grid {name: {name}})',
            'RETURN grid',
        ].join('\n'),
        params: {
            name: name
        }
    }

    db.cypher(qp, function (err, results) {
        if (err) return callback(err);
        callback(null, results[0]['grid']);
    });

}


Grid.addUserRelationship = function (relation, gridId, userId, callback) {
    switch (relation) {
        case 'creates':

            /**
             * First we create the node that will relate the grid with the user and will have the name 
             * of the grid
             */
            var qp = {
                query: [
                    'MATCH (user:User),(grid:Grid)',
                    'WHERE ID(user) = {userId} AND ID(grid) = {gridId}',
                    'MERGE (user)-[rel:creates]->(grid)',
                    'ON CREATE SET rel.properties = timestamp()',
                    'RETURN rel'
                ].join('\n'),
                params: {
                    userId: userId,
                    gridId: gridId,
                }
            }
            break;
        case 'deletes':
            var qp = {
                query: [
                    'MATCH (user:User) -[rel:follows]-> (other:User)',
                    'WHERE ID(user) = {userId} AND ID(other) = {otherId}',
                    'DELETE rel'
                ].join('\n'),
                params: {
                    userId: userId,
                    otherId: otherId,
                }
            }
            break;
    }

    db.cypher(qp, function (err, result) {
        callback(err);
    });
}



