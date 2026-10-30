import type { Priority } from '@/contracts';
import { Badge } from '@/ui/Badge';

const LABELS: Record<Priority, string> = {
  urgent: 'Urgent',
  normal: 'Normal',
  optional: 'Optional',
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <Badge tone={priority} withDot={priority === 'urgent'}>
      {LABELS[priority]}
    </Badge>
  );
}
