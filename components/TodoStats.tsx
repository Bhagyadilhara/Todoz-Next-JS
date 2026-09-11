interface TodoStatsProps {
  total: number;
  active: number;
  completed: number;
}

export default function TodoStats({ total, active, completed }: TodoStatsProps) {
  return (
    <p className="text-sm text-zinc-500 dark:text-zinc-400">
      {total} total &bull; {active} active &bull; {completed} completed
    </p>
  );
}
