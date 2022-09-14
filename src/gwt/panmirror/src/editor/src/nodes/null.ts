/*
 * null.ts
 *
 * Copyright (C) 2022 by Posit Software, PBC
 *
 * Unless you have received this program directly from Posit pursuant
 * to the terms of a commercial license agreement with Posit, then
 * this program is licensed to you under the terms of version 3 of the
 * GNU Affero General Public License. This program is distributed WITHOUT
 * ANY EXPRESS OR IMPLIED WARRANTY, INCLUDING THOSE OF NON-INFRINGEMENT,
 * MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE. Please refer to the
 * AGPL (http://www.gnu.org/licenses/agpl-3.0.txt) for more details.
 *
 */

import { Extension } from '../api/extension';
import { PandocOutput, PandocTokenType } from '../api/pandoc';

import './null-styles.css';

const extension: Extension = {
  nodes: [
    {
      name: 'null',
      spec: {
        group: 'block',
        atom: true,
        selectable: false,
        parseDOM: [{ tag: "div[class*='null-block']" }],
        toDOM() {
          return ['div', { class: 'null-block' }];
        },
      },
      pandoc: {
        readers: [
          {
            token: PandocTokenType.Null,
            node: 'null',
          },
        ],
        writer: (output: PandocOutput) => {
          output.writeToken(PandocTokenType.Null);
        },
      },
    },
  ],
};

export default extension;
