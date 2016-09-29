'use babel';

import QuickVueView from './quick-vue-view';
import { CompositeDisposable } from 'atom';
import path from 'path';

var vueComponentReg = /<\/?([\w\-]+)/g;
var htmlLikeFileReg = /\.(vm|html)$/;

export default {

  quickVueView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.quickVueView = new QuickVueView(state.quickVueViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.quickVueView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'quick-vue:goto': () => this.goto()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.quickVueView.destroy();
  },

  serialize() {
    return {
      quickVueViewState: this.quickVueView.serialize()
    };
  },

  goto(state) {
    var editor = atom.workspace.getActiveTextEditor();
    var cursorPosition = editor.getCursorBufferPosition();
    var scanRange = editor.bufferRangeForBufferRow(cursorPosition.row);
    var compName;

    editor.scanInBufferRange(vueComponentReg, scanRange, function(res) {
      if (res.range.containsPoint(cursorPosition)) {
        compName = res.match[1];
        res.stop();
      }
    });

    if (!compName) {
      return;
    }

    var curFilePath = editor.getPath();

    if (!curFilePath || !curFilePath.match(htmlLikeFileReg)) {
      return;
    }

    var jsFilePath = curFilePath.replace(htmlLikeFileReg, '.js');

    // read settings file
    if (!fs.existsSync(jsFilePath)) {
      return;
    }

    var jsFileText = fs.readFileSync(jsFilePath, 'utf8');
    var compPath;

    jsFileText.split(/\r?\n/).forEach(function(line, index) {
      var compPathReg = new RegExp("'" + compName + "': \\w+\\('(.*)'\\)", 'g');
      var result = compPathReg.exec(line);

      if (result) {
          compPath = result[1];

          return true;
      }
    });

    if (!compPath) {
        return;
    }

    if (compPath[0] === '/') {
        compPath = compPath.substr(1);
    }

    var compFullPath = atom.project.getPaths() + '/' + compPath;

    // open file
    var pane = atom.workspace.getActivePane();

    var options = {searchAllPanes: false};

    atom.workspace.open(compFullPath, options)
  }

};
