// requires
var library = require('./library.js');

// the required functions as defined
var makeRelationshipSet = library.makeRelationshipSet;
var dependsOn           = library.dependsOn;
var areExclusive        = library.areExclusive;
var checkRelationships  = library.checkRelationships;




// TEST.js

var s, selected;

s = makeRelationshipSet();
s = dependsOn('a', 'a', s);
console.assert(checkRelationships(s));

s = makeRelationshipSet();
s = dependsOn('a', 'b', s);
s = dependsOn('b', 'a', s);
console.assert(checkRelationships(s));

s = makeRelationshipSet();
s = dependsOn('a', 'b', s);
s = areExclusive('a', 'b', s);
console.assert(!checkRelationships(s));

s = makeRelationshipSet();
s = dependsOn('a', 'b', s);
s = dependsOn('b', 'c', s);
s = areExclusive('a', 'c', s);
console.assert(!checkRelationships(s));

s = makeRelationshipSet();
s = dependsOn('a', 'b', s);
s = dependsOn('b', 'c', s);
s = dependsOn('c', 'a', s);
s = dependsOn('d', 'e', s);
s = areExclusive('c', 'e', s);
console.assert(checkRelationships(s));
