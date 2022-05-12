/*
    Copyright 2020-2021. Huawei Technologies Co., Ltd. All rights reserved.

    Licensed under the Apache License, Version 2.0 (the "License")
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        https://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
*/

/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

const path = require('path');
const exclusionList = require('metro-config/src/defaults/exclusionList');
const escape = require('escape-string-regexp');
const pak = require('../package.json');
const root = path.resolve(__dirname, '..');
const modules = Object.keys({
	...pak.devDependencies
});

module.exports = {
  projectRoot: __dirname,
  watchFolders: [root],

  resolver: {
		// This one does not really seem to be necessary, considering the root folder
		// does not have a node_modules, but why not keep it?
    blockList: exclusionList(modules.map((m) => new RegExp(`^${escape(path.join(root, 'node_modules', m))}\\/.*$`))),

		// This allows the parent folder to use its devDependencies (react and react-native)
		// from the node_modules in the example folder.
	  extraNodeModules: modules.reduce((acc, name) => {
		  acc[name] = path.join(__dirname, 'node_modules', name);
		  return acc;
	  }, {})
  },

  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false,
      },
    }),
  },

};
