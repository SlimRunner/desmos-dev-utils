/**
 * Copyright (c) 2024 Jared Hughes
 *
 * This file is part of DesModder which is released under MIT license.
 * Go to
 * https://github.com/DesModder/DesModder/blob/56c7dcb7a24c2cda5db70623200609b4dfac50f7/graph-state/LICENSE
 * for more details
 */

import { VanillaDispatchedEvent } from "./Calc";

/**
 * This AllActions interface is intended to be extended through module
 * augmentation and interface merging. See handle-dispatches/README.md.
 */
export interface AllActions {
  vanilla: VanillaDispatchedEvent;
}

export type DispatchedEvent = AllActions[keyof AllActions];
