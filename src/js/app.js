import $ from 'jquery';
import {parseCode,itercode} from './code-analyzer';
import {makeGraph} from './code-analyzer';
import * as esgraph from 'esgraph';
import * as viz from 'viz.js';

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let code = $('#codePlaceholder').val();
        let parsedCode = parseCode(code);
        let newParse = parseCode(code);
        let cfg = esgraph(parsedCode.body[0].body);
        let dot = esgraph.dot(cfg,{counter: 0});
        let params = $('#codeArguments').val();
        let colors=itercode(newParse,params);
        let g = makeGraph(cfg,dot,colors);
        let graph = viz('digraph{'+g+'}');
        let doc=document.getElementById('cfgGraph');
        doc.innerHTML = graph;
    });
});
