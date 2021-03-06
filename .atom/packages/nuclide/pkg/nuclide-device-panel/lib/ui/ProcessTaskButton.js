'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ProcessTaskButton = undefined;

var _Dropdown;

function _load_Dropdown() {
  return _Dropdown = require('../../../nuclide-ui/Dropdown');
}

var _react = _interopRequireDefault(require('react'));

var _Icon;

function _load_Icon() {
  return _Icon = require('nuclide-commons-ui/Icon');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class ProcessTaskButton extends _react.default.Component {

  _getTaskOptions() {
    return this.props.tasks.filter(task => task.type === this.props.taskType && task.isSupported(this.props.proc)).map(task => ({ value: task, label: task.name }));
  }

  render() {
    const options = this._getTaskOptions();
    if (options.length === 0) {
      return _react.default.createElement('div', null);
    } else if (options.length === 1) {
      return _react.default.createElement(
        'span',
        { onClick: () => options[0].value.run(this.props.proc) },
        _react.default.createElement((_Icon || _load_Icon()).Icon, {
          icon: this.props.icon,
          title: options[0].label,
          className: this.props.className
        })
      );
    } else {
      const placeholder = _react.default.createElement((_Icon || _load_Icon()).Icon, { icon: this.props.icon, title: this.props.nameIfManyTasks });
      return _react.default.createElement((_Dropdown || _load_Dropdown()).Dropdown, {
        isFlat: true,
        options: options,
        placeholder: placeholder,
        size: 'xs',
        onChange: task => task != null && task.run(this.props.proc)
      });
    }
  }
}
exports.ProcessTaskButton = ProcessTaskButton; /**
                                                * Copyright (c) 2015-present, Facebook, Inc.
                                                * All rights reserved.
                                                *
                                                * This source code is licensed under the license found in the LICENSE file in
                                                * the root directory of this source tree.
                                                *
                                                * 
                                                * @format
                                                */