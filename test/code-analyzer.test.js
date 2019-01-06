import assert from 'assert';
import {parseCode,itercode,makeGraph} from '../src/js/code-analyzer';
import * as esgraph from 'esgraph';

describe('The javascript parser', () => {
    testSimpleFunction();
    testLocalVariable();
    testIfStatements();
    testWhileStatement();
});

function testSimpleFunction(){
    it('is graph a simple function correctly', () => {
        assert.equal(
            getGraph('function f(x) {let a=x+1;return a;}','1'),
            'n1 [label="-1-\n' +
            'a = x + 1", shape="box", style="filled", fillcolor="green"]\n'+
            'n2 [label="-2-\n'+
            'return a", shape="box", style="filled", fillcolor="green"]\n'+
            'n1 -> n2 []\n'
        );
        assert.equal(
            getGraph('function f(x) {let a=-1;return a;}','1'),
            'n1 [label="-1-\n' +
            'a = -1", shape="box", style="filled", fillcolor="green"]\n'+
            'n2 [label="-2-\n'+
            'return a", shape="box", style="filled", fillcolor="green"]\n'+
            'n1 -> n2 []\n'
        );
        assert.deepEqual(
            getGraph('function f(x) {let a;a=x+1;return a;}','3'),
            'n1 [label="-1-\n'+
            'a", shape="box", style="filled", fillcolor="green"]\n'+
            'n2 [label="-2-\n'+
            'a = x + 1", shape="box", style="filled", fillcolor="green"]\n'+
            'n3 [label="-3-\n'+
            'return a", shape="box", style="filled", fillcolor="green"]\n'+
            'n1 -> n2 []\n'+
            'n2 -> n3 []\n'
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
    it('is graph a local variable correctly', () => {
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

function testIfStatements() {
    it('is graph a if statement correctly', () => {
        assert.equal(
            getGraph('function foo(x, y, z){\n' +
                '    let a = x + 1;\n' + '    let b = a + y;\n' + '    let c = 0;\n' +
                '    if (b < z * 2) {\n' + '        c = c + 5;\n' +
                '    } else if (b < z) {\n' + '        c = c + x + 5;\n' +
                '    } \n'  +'   return c;\n'+ '}','1,2,3'),
            'n1 [label="-1-\n'+
            'a = x + 1", shape="box", style="filled", fillcolor="green"]\n'+
            'n2 [label="-2-\n'+
            'b = a + y", shape="box", style="filled", fillcolor="green"]\n'+
            'n3 [label="-3-\n'+
            'c = 0", shape="box", style="filled", fillcolor="green"]\n'+
            'n4 [label="-4-\n'+
            'b < z * 2", shape="diamond", style="filled", fillcolor="green"]\n'+
            'n5 [label="-5-\n'+
            'c = c + 5", shape="box", style="filled", fillcolor="green"]\n'+
            'n6 [label="-6-\n'+
            'return c", shape="box", style="filled", fillcolor="green"]\n'+
            'n7 [label="-7-\n'+
            'b < z", shape="diamond"]\n'+
            'n8 [label="-8-\n'+
            'c = c + x + 5", shape="box"]\n'+
            'n1 -> n2 []\n'+
            'n2 -> n3 []\n'+
            'n3 -> n4 []\n'+
            'n4 -> n5 [label="true"]\n'+
            'n4 -> n7 [label="false"]\n'+
            'n5 -> n6 []\n'+
            'n7 -> n8 [label="true"]\n'+
            'n7 -> n6 [label="false"]\n'+
            'n8 -> n6 []\n'
        );
        assert.equal(
            getGraph('function foo(x, y, z){\n' +
                '    let a = x + 1;\n' + '    let b = a + y;\n' + '    let c = 0;\n' +
                '    if (b < z) {\n' + '        c = c + 5;\n' +
                '    } else if (b < z * 2) {\n' + '        c = c + x + 5;\n' +
                '    } else {\n' + '        c = c + z + 5;\n' +  '    }\n' +'   return c;\n'+ '}','1,2,3'),
            'n1 [label="-1-\n'+
            'a = x + 1", shape="box", style="filled", fillcolor="green"]\n'+
            'n2 [label="-2-\n'+
            'b = a + y", shape="box", style="filled", fillcolor="green"]\n'+
            'n3 [label="-3-\n'+
            'c = 0", shape="box", style="filled", fillcolor="green"]\n'+
            'n4 [label="-4-\n'+
            'b < z", shape="diamond", style="filled", fillcolor="green"]\n'+
            'n5 [label="-5-\n'+
            'c = c + 5", shape="box"]\n'+
            'n6 [label="-6-\n'+
            'return c", shape="box", style="filled", fillcolor="green"]\n'+
            'n7 [label="-7-\n'+
            'b < z * 2", shape="diamond", style="filled", fillcolor="green"]\n'+
            'n8 [label="-8-\n'+
            'c = c + x + 5", shape="box", style="filled", fillcolor="green"]\n'+
            'n9 [label="-9-\n'+
            'c = c + z + 5", shape="box"]\n'+
            'n1 -> n2 []\n'+
            'n2 -> n3 []\n'+
            'n3 -> n4 []\n'+
            'n4 -> n5 [label="true"]\n'+
            'n4 -> n7 [label="false"]\n'+
            'n5 -> n6 []\n'+
            'n7 -> n8 [label="true"]\n'+
            'n7 -> n9 [label="false"]\n'+
            'n8 -> n6 []\n'+
            'n9 -> n6 []\n'
        );

        assert.deepEqual(
            getGraph('function f(x,y) {x[0]=y+2;let a=[1,2,3];a[0]=x[0];if (!(a[0] < y)) {return y;}}','[3,2],4'),
            'n1 [label="-1-\n'+
            'x[0] = y + 2", shape="box", style="filled", fillcolor="green"]\n'+
            'n2 [label="-2-\n'+
            'a = [\n'+
            '    1,\n'+
            '    2,\n'+
            '    3\n'+
            ']", shape="box", style="filled", fillcolor="green"]\n'+
            'n3 [label="-3-\n'+
            'a[0] = x[0]", shape="box", style="filled", fillcolor="green"]\n'+
            'n4 [label="-4-\n'+
            '!(a[0] < y)", shape="box", style="filled", fillcolor="green"]\n'+
            'n5 [label="-5-\n'+
            'return y", shape="box", style="filled", fillcolor="green"]\n'+
            'n1 -> n2 []\n'+
            'n2 -> n3 []\n'+
            'n3 -> n4 []\n'+
            'n4 -> n5 [label="true"]\n'
        );


    });
}

function testWhileStatement() {
    it('is graph a while statement correctly', () => {
        assert.equal(
            getGraph('function f(x) {let a=x+1;while(a<x){a++;}return a;}','2'),
            'n1 [label="-1-\n'+
            'a = x + 1", shape="box", style="filled", fillcolor="green"]\n'+
            'n2 [label="-2-\n'+
            'a < x", shape="diamond", style="filled", fillcolor="green"]\n'+
            'n3 [label="-3-\n'+
            'a++", shape="box"]\n'+
            'n4 [label="-4-\n'+
            'return a", shape="box", style="filled", fillcolor="green"]\n'+
            'n1 -> n2 []\n'+
            'n2 -> n3 [label="true"]\n'+
            'n2 -> n4 [label="false"]\n'+
            'n3 -> n2 []\n'
        );
        assert.equal(
            getGraph('function f(x) {let a=x+1;while(a<x){if(a==3) a++;}return a;}','1'),
            'n1 [label="-1-\n'+
            'a = x + 1", shape="box", style="filled", fillcolor="green"]\n'+
            'n2 [label="-2-\n'+
            'a < x", shape="diamond", style="filled", fillcolor="green"]\n'+
            'n3 [label="-3-\n'+
            'a == 3", shape="diamond"]\n'+
            'n4 [label="-4-\n'+
            'a++", shape="box"]\n'+
            'n5 [label="-5-\n'+
            'return a", shape="box", style="filled", fillcolor="green"]\n'+
            'n1 -> n2 []\n'+
            'n2 -> n3 [label="true"]\n'+
            'n2 -> n5 [label="false"]\n'+
            'n3 -> n4 [label="true"]\n'+
            'n3 -> n2 [label="false"]\n'+
            'n4 -> n2 []\n'
        );
    });
}

function getGraph(code,params) {
    let parsedCode = parseCode(code);
    let newParse = parseCode(code);
    let cfg = esgraph(parsedCode.body[0].body);
    let dot = esgraph.dot(cfg,{counter: 0});
    let colors=itercode(newParse,params);
    let g = makeGraph(cfg,dot,colors);
    return g;
}
