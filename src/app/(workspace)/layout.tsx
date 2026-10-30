import type { ReactNode } from 'react';
import { WorkspaceShell } from '@/ui/WorkspaceShell';

export default function WorkspaceGroupLayout({ children }: { children: ReactNode }) {
  return <WorkspaceShell>{children}</WorkspaceShell>;
}
