import assert from 'assert';
import {parseCode,itercode,makeGraph} from '../src/js/code-analyzer';
import * as esgraph from 'esgraph';

describe('The javascript parser', () => {
    testSimpleFunction();
    testLocalVariable();
    //testIfStatements();
    //testWhileStatement();
});

function testSimpleFunction(){
    it('is substituting a simple function correctly', () => {
        assert.equal(
            getGraph('function f(x) {let a=x+1;return a;}','1'),
            'n1 [label="-1-\n' +
            'a = x + 1", shape="box", style="filled", fillcolor="green"]\n'+
            'n2 [label="-2-\n'+
            'return a", shape="box", style="filled", fillcolor="green"]\n'+
            'n1 -> n2 []\n'
        );
        assert.equal(
            getGraph('function f(x) {let a=x+1;a=a+1;return a;}','3'),
            'n1 [label="-1-\n'+
            'a = x + 1", shape="box", style="filled", fillcolor="green"]\n'+
            'n2 [label="-2-\n'+
            'a = a + 1", shape="box", style="filled", fillcolor="green"]\n'+
            'n3 [label="-3-\n'+
            'return a", shape="box", style="filled", fillcolor="green"]\n'+
            'n1 -> n2 []\n'+
            'n2 -> n3 []\n'
        );
    });
}

function testLocalVariable(){
    it('is substituting a local variable correctly', () => {
        assert.deepEqual(
            getGraph('function f(x,y) {x[0]=y+2;let a=[1,2,3];a[0]=x[0];return a;}','[3,2],4'),
            'n1 [label="-1-\n'+
            'x[0] = y + 2", shape="box", style="filled", fillcolor="green"]\n'+
            'n2 [label="-2-\n'+
            'a = [\n    1,\n    2,\n    3\n]", shape="box", style="filled", fillcolor="green"]\n'+
            'n3 [label="-3-\n'+
            'a[0] = x[0]", shape="box", style="filled", fillcolor="green"]\n'+
            'n4 [label="-4-\n'+
            'return a", shape="box", style="filled", fillcolor="green"]\n'+
            'n1 -> n2 []\n'+
            'n2 -> n3 []\n'+
            'n3 -> n4 []\n'
        );

    });
}

/*function testIfStatements() {
    it('is substituting a if statement correctly', () => {
        assert.deepEqual(
            getGraph('function foo(x, y, z){\n' +
                '    let a = x + 1;\n' + '    let b = a + y;\n' + '    let c = 0;\n' +
                '    if (b < z) {\n' + '        c = c + 5;\n' + '        return x + y + z + c;\n' +
                '    } else if (b < z * 2) {\n' + '        c = c + x + 5;\n' + '        return x + y + z + c;\n' +
                '    } else {\n' + '        c = c + z + 5;\n' + '        return x + y + z + c;\n' + '    }\n' + '}','1,2,3'),
            'function foo(x, y, z) {\n' +
            '    if (x + 1 + y < z) {\n' +
            '        return x + y + z + (0 + 5);\n' +
            '    } else if (x + 1 + y < z * 2) {\n' +
            '        return x + y + z + (0 + x + 5);\n' +
            '    } else {\n' +
            '        return x + y + z + (0 + z + 5);\n' +
            '    }\n' + '}'
        );
        assert.deepEqual(
            getGraph('function f(x,y) {x[0]=y+2;let a=[1,2,3];a[0]=x[0];if (!(a[0] < y)) {return y;}}','[3,2],4'),
            'function f(x, y) {\n' +
            '    x[0] = y + 2;\n'+
            '    if (!(x[0] < y)) {\n'+
            '        return y;\n' +
            '    }\n'+
            '}'
        );
        assert.deepEqual(
            getGraph('function f(x,y) {let a=[1,2,3];a[0]=x[0];if (x.length < y) {return a;}}','[3,2],4'),
            'function f(x, y) {\n' +
            '    if (x.length < y) {\n'+
            '        return [\n            x[0],\n            2,\n            3\n        ];\n' +
            '    }\n'+
            '}'
        );

    });
}

function testWhileStatement() {
    it('is substituting a while statement correctly', () => {
        assert.deepEqual(
            getGraph('let b=1;function f(x) {let a=x+1;while(a<b){return a;}}','2'),
            'function f(x) {\n' +
            '    while (x + 1 < 1) {\n'+
            '        return x + 1;\n' +
            '    }\n'+
            '}'
        );
    });
}*/

function getGraph(code,params) {
    let parsedCode = parseCode(code);
    let newParse = parseCode(code);
    let cfg = esgraph(parsedCode.body[0].body);
    let dot = esgraph.dot(cfg,{counter: 0});
    let colors=itercode(newParse,params);
    let g = makeGraph(cfg,dot,colors);
    return g;
}
