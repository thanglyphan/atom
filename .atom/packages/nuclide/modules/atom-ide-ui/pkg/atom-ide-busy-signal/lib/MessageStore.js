'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MessageStore = undefined;

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _collection;

function _load_collection() {
  return _collection = require('nuclide-commons/collection');
}

var _BusyMessageInstance;

function _load_BusyMessageInstance() {
  return _BusyMessageInstance = require('./BusyMessageInstance');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// The "busy debounce delay" is for busy messages that were created with the
// 'debounce' option set to true. The icon and tooltip message won't appear
// until this many milliseconds have elapsed; if the busy message gets disposed
// before this time, then the user won't see anything.
/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */

const BUSY_DEBOUNCE_DELAY = 300;

const emptyTarget = {
  waitingForComputer: false,
  waitingForUser: false
};

class MessageStore {
  constructor() {
    this._counter = 0;
    this._messages = new Set();
    this._messageStream = new _rxjsBundlesRxMinJs.BehaviorSubject([]);
    this._targetStream = new _rxjsBundlesRxMinJs.BehaviorSubject(emptyTarget);
  }
  // _messages will include all messages in the store, including those that
  // aren't currently visible. _messageStream will only contain visible ones.


  getMessageStream() {
    return this._messageStream;
  }

  getTargetStream() {
    return this._targetStream;
  }

  dispose() {
    const messagesToDispose = [...this._messages];
    for (const message of messagesToDispose) {
      message.dispose();
    }

    if (!(this._messages.size === 0)) {
      throw new Error('Invariant violation: "this._messages.size === 0"');
    }

    this._messageStream.complete();
    this._targetStream.complete();
  }

  _publish() {
    const messages = [...this._messages].filter(m => m.isVisible()).sort((m1, m2) => m1.compare(m2));

    const prevTarget = this._targetStream.getValue();
    const newTarget = {
      waitingForComputer: messages.some(m => m.waitingFor === 'computer'),
      waitingForUser: messages.some(m => m.waitingFor === 'user')
    };
    if (newTarget.waitingForUser !== prevTarget.waitingForUser || newTarget.waitingForComputer !== prevTarget.waitingForComputer) {
      this._targetStream.next(newTarget);
    }

    const prevMessages = this._messageStream.getValue();
    const newMessages = (0, (_collection || _load_collection()).arrayCompact)(messages.map(m => m.getTitleHTML()));
    if (!(0, (_collection || _load_collection()).arrayEqual)(newMessages, prevMessages)) {
      this._messageStream.next(newMessages);
    }
  }

  add(title, options) {
    this._counter++;

    const creationOrder = this._counter;
    const waitingFor = options != null && options.waitingFor != null ? options.waitingFor : 'computer';
    const onDidClick = options == null ? null : options.onDidClick;
    const messageDisposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();

    const message = new (_BusyMessageInstance || _load_BusyMessageInstance()).BusyMessageInstance(this._publish.bind(this), creationOrder, waitingFor, onDidClick, messageDisposables);
    this._messages.add(message);
    messageDisposables.add(() => this._messages.delete(message));

    if (options == null || options.debounce !== false) {
      message.setIsVisibleForDebounce(false);
      // After the debounce time, we'll check whether the messageId is still
      // around (i.e. hasn't yet been disposed), and if so we'll display it.
      let timeoutId = 0;
      const teardown = () => clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (!!messageDisposables.disposed) {
          throw new Error('Invariant violation: "!messageDisposables.disposed"');
        }

        if (!this._messages.has(message)) {
          throw new Error('Invariant violation: "this._messages.has(message)"');
        }
        // If the message was disposed, then it should have already called
        // clearTimeout, so this timeout handler shouldn't have been invoked.
        // And also the message should have been removed from this._messages.
        // So both tests above should necessary fail.
        // If the messageStore was disposed, then every message in it should
        // already have been disposed, as per above.


        messageDisposables.remove(teardown);
        message.setIsVisibleForDebounce(true);
      }, BUSY_DEBOUNCE_DELAY);
      messageDisposables.add(teardown);
    }

    if (options != null && options.onlyForFile != null) {
      message.setIsVisibleForFile(false);
      const file = options.onlyForFile;
      const teardown = atom.workspace.observeActivePaneItem(item => {
        const activePane = item != null && typeof item.getPath === 'function' ? String(item.getPath()) : null;
        const newVisible = activePane === file;
        message.setIsVisibleForFile(newVisible);
      });
      messageDisposables.add(teardown);
    }

    message.setTitle(title);

    // Quick note that there aren't races in the above code! 'message' will not
    // be displayed until it has a title. So we can set visibility all we like,
    // and then when the title is set, it will display or not as appropriate.

    return message;
  }
}
exports.MessageStore = MessageStore;