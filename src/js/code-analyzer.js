import * as esprima from 'esprima';
import * as escodegen from 'escodegen';

let args={};
let oldArgs={};
let arrayColors=[];
let Input=[];
let listNodes=[];
let listRoles=[];
let j=0;
let countRole=0;
let nodesFalse=[];

const parseCode = (codeToParse) => {
    return esprima.parseScript(codeToParse,{loc:true});
};

const revertCode = (code) => {
    return escodegen.generate(code);
};

export {parseCode,itercode};
export {revertCode};
export {makeGraph};

const makeGraph = (cfg,dot,color) => {
    listNodes=[];
    listRoles=[];
    initNodesAndRoles(dot);
    deleteNodes();
    let newNodes=[];
    for (let i=0;i<listNodes.length;i++){
        if(i==0 || i==listNodes.length-1)
            continue;
        else newNodes.push(listNodes[i]);
    }
    listNodes=newNodes;
    listNodes=getShapes(listNodes);
    listNodes=getColors(listNodes,listRoles,color);
    listNodes=replaceLabel(listNodes,cfg);
    let graph = makeStringGraph(listNodes,listRoles);
    return graph;
};

function initNodesAndRoles(dot) {
    let lines = dot.split('\n');
    for (let i=0;i<lines.length;i++){
        if(lines[i].includes('->')){
            listRoles.push(lines[i]);
        }
        else if(lines[i] != '')
            listNodes.push(lines[i].split(' '));
    }
}

function deleteNodes() {
    let lastNode=listNodes[listNodes.length-1];
    let exit=lastNode[0];
    let newRoles=[];
    for (let i=0;i<listRoles.length;i++){
        if(listRoles[i].includes('n0') || listRoles[i].includes(exit))
            continue;
        else newRoles.push(listRoles[i].split(' '));
    }
    listRoles=newRoles;
}

function makeStringGraph(listNodes,listRoles){
    let graph='';
    for(let i=0;i<listNodes.length;i++){
        graph+=listNodes[i][0]+' [label="'+listNodes[i][1]+'", shape="'+listNodes[i][2]+'"';
        if(listNodes[i][3]=='green')
            graph+=', style="filled", fillcolor="green"';
        graph+=']\n';
    }
    for(let i=0;i<listRoles.length;i++){
        graph+=listRoles[i].join(' ')+'\n';
    }
    return graph;
}

function getShapes(listNodes){
    for(let i=0;i<listNodes.length;i++){
        let splitLabel=listNodes[i][1].split('"');
        listNodes[i][1]=splitLabel[1];
        if(listNodes[i][1] != 'BinaryExpression')
            listNodes[i].push('box');
        else listNodes[i].push('diamond');
    }
    return listNodes;
}

function replaceLabel(listNodes,cfg){
    for(let i=1;i<=listNodes.length;i++){
        if(revertCode(cfg[2][i].astNode).includes('let')){
            listNodes[i-1][1]='-'+i+'-\n'+revertCode(cfg[2][i].astNode).substring(4);
        }
        else listNodes[i-1][1]='-'+i+'-\n'+revertCode(cfg[2][i].astNode);
        if(listNodes[i-1][1].includes(';')){
            listNodes[i-1][1]=listNodes[i-1][1].substring(0,listNodes[i-1][1].length-1);
        }
    }
    return listNodes;
}

function getColors(listNodes,listRoles,color){
    j=0;
    countRole=0;
    nodesFalse=[];
    for (let i=0;i<listNodes.length;i++) {
        if(listNodes[i][1] == 'ReturnStatement'){
            listNodes[i].push('green');
        }
        else if(listNodes[i][1] != 'BinaryExpression'){
            if(nodesFalse.indexOf(listNodes[i][0]) == -1)
                listNodes[i].push('green');
        }
        else{
            binaryColor(i,color);
        }
    }
    return listNodes;
}

function binaryColor(i,color){
    if(nodesFalse.indexOf(listNodes[i][0]) >= 0){
        j++;
        return;}
    else listNodes[i].push('green');
    while(listRoles[countRole][0] != listNodes[i][0])
        countRole++;
    if(color[j]=='true'){
        ifGreen();}
    else{
        ifWhite();
    }
    j++;
}

function ifWhite() {
    nodesFalse.push(listRoles[countRole][2]);
    for(let k=countRole+1;k<listRoles.length;k++){
        if (nodesFalse.indexOf(listRoles[k][0]) >= 0){
            nodesFalse.push(listRoles[k][2]);
        }
    }
}
function ifGreen() {
    countRole++;
    nodesFalse.push(listRoles[countRole][2]);
    for(let k=countRole+1;k<listRoles.length;k++){
        if (nodesFalse.indexOf(listRoles[k][0]) >= 0){
            nodesFalse.push(listRoles[k][2]);
        }
    }
}
const itercode = (parsedCode,params) => {
    oldArgs={};
    arrayColors=[];
    Input=[];
    args={};
    initParams(params);
    let body = [];
    for (let i = 0; i < parsedCode.body.length; i++){
        body.push(parsedCode.body[i]);
    }
    parsedCode.body=body;
    for (let i=0 ; i<parsedCode.body.length; i++){
        parsedCode.body[i]=loopItercode(parsedCode.body[i]);
    }
    return arrayColors;
};
function initParams(params) {
    let parse=parseCode(params);
    if(parse.body[0].expression.expressions!=null){
        Input=parse.body[0].expression.expressions;
    }
    else Input[0]=parse.body[0].expression;
}

function loopItercode(codeJsonBody){
    if((codeJsonBody.type == 'Literal') ||(codeJsonBody.type == 'UpdateExpression'))
        return codeJsonBody;
    let func = loopFunction[codeJsonBody.type];
    return func(codeJsonBody);
}
const loopFunction = {
    Identifier: identifier,
    ArrayExpression: arrayExpression,
    BlockStatement: blockStatement,
    ExpressionStatement: expressionStatement,
    VariableDeclaration: variableDeclaration,
    BinaryExpression: binaryExpression,
    UnaryExpression: unaryExpression,
    MemberExpression: memberExpression,
    ReturnStatement: returnStatement,
    AssignmentExpression: assignmentExpression,
    IfStatement: ifStatement,
    WhileStatement: whileStatement,
    FunctionDeclaration :functionDeclaration
};

function functionDeclaration(codeJsonBody) {
    for (let i=0 ; i<codeJsonBody.params.length; i++){
        args[codeJsonBody.params[i].name]=Input[i];
    }
    loopItercode(codeJsonBody.body);
    return codeJsonBody;
}

function variableDeclaration(codeJsonBody){
    for(let i=0 ; i<codeJsonBody.declarations.length; i++){
        if(codeJsonBody.declarations[i].init!=null){
            args[codeJsonBody.declarations[i].id.name]=loopItercode(codeJsonBody.declarations[i].init);
        }
        else args[codeJsonBody.declarations[i].id.name]=null;
    }
    return codeJsonBody;
}

function expressionStatement(codeJsonBody){
    loopItercode(codeJsonBody.expression);

    return codeJsonBody;
}

function assignmentExpression(codeJsonBody) {
    if(codeJsonBody.left.type=='Identifier'){
        args[codeJsonBody.left.name]=loopItercode(codeJsonBody.right);
    }
    else
        args[codeJsonBody.left.object.name].elements[codeJsonBody.left.property.raw]=loopItercode(codeJsonBody.right);
    return codeJsonBody;
}


function arrayExpression(codeJsonBody) {
    for (let i=0;i<codeJsonBody.elements.length;i++){
        codeJsonBody.elements[i]=loopItercode(codeJsonBody.elements[i]);
    }
    return codeJsonBody;
}


function binaryExpression(codeJsonBody){
    codeJsonBody.left=loopItercode(codeJsonBody.left);
    codeJsonBody.right=loopItercode(codeJsonBody.right);
    return codeJsonBody;
}


function identifier(codeJsonBody) {
    return args[codeJsonBody.name];
}

function whileStatement(codeJsonBody){
    codeJsonBody.test=loopItercode(codeJsonBody.test);
    let test=colorLines(codeJsonBody.test);
    arrayColors.push(test);
    codeJsonBody.body=loopItercode(codeJsonBody.body);

    return codeJsonBody;
}


function ifStatement(codeJsonBody){
    codeJsonBody.test=loopItercode(codeJsonBody.test);
    let test=colorLines(codeJsonBody.test);
    arrayColors.push(test);
    codeJsonBody.consequent=loopItercode(codeJsonBody.consequent);
    if(codeJsonBody.alternate!=null) {
        codeJsonBody.alternate=alternate(codeJsonBody.alternate);
    }
    return codeJsonBody;
}

function alternate(codeJsonBody){
    if (codeJsonBody.type == 'IfStatement') {
        codeJsonBody=ifStatement(codeJsonBody);
    }
    else{
        codeJsonBody=loopItercode(codeJsonBody);
    }

    return codeJsonBody;
}

function memberExpression(codeJsonBody) {
    codeJsonBody.property=loopItercode(codeJsonBody.property);
    return args[codeJsonBody.object.name].elements[codeJsonBody.property.raw];
}

function unaryExpression(codeJsonBody){
    codeJsonBody.argument=loopItercode(codeJsonBody.argument);
    return codeJsonBody;
}

function returnStatement(codeJsonBody){
    codeJsonBody.argument=loopItercode(codeJsonBody.argument);
    return codeJsonBody;
}

function blockStatement(codeJsonBody,rows) {
    oldArgs = {};
    for(let obj in args){
        oldArgs[obj]=args[obj];
    }
    for (let i = 0; i < codeJsonBody.body.length; i++) {
        codeJsonBody.body[i]=loopItercode(codeJsonBody.body[i], rows);
    }
    args = {};
    for(let obj in oldArgs){
        args[obj]=oldArgs[obj];
    }
    return codeJsonBody;
}

function colorLines(jsonTest) {
    let test=revertCode(jsonTest);
    let ifGreen=eval(test);
    if(ifGreen==true){
        return 'true';
    }
    else return 'false';
}



