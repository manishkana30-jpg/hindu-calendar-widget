"use client";

import { FloatingActionDock, FloatingActionDockProps } from '@/src/components/FloatingActionDock';

export type FloatingInstallShareProps = FloatingActionDockProps;

/**
 * Re-export FloatingActionDock as FloatingInstallShare for backward compatibility.
 */
export { FloatingActionDock, FloatingActionDock as FloatingInstallShare };
export default FloatingActionDock;
