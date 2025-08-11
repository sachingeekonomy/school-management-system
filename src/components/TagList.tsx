interface TagListProps {
  items: { id: string | number; name: string }[];
  maxWidth?: string;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  size?: 'xs' | 'sm' | 'md';
}

const colorClasses = {
  blue: 'bg-blue-100 text-blue-800',
  green: 'bg-green-100 text-green-800',
  purple: 'bg-purple-100 text-purple-800',
  orange: 'bg-orange-100 text-orange-800',
  red: 'bg-red-100 text-red-800'
};

const sizeClasses = {
  xs: 'px-2 py-1 text-xs',
  sm: 'px-3 py-1 text-sm',
  md: 'px-4 py-2 text-base'
};

export default function TagList({ 
  items, 
  maxWidth = "max-w-[200px]", 
  color = 'blue',
  size = 'xs'
}: TagListProps) {
  if (!items || items.length === 0) {
    return <span className="text-gray-400 text-xs">None</span>;
  }

  return (
    <div className={`flex flex-wrap gap-1 ${maxWidth}`}>
      {items.map((item) => (
        <span
          key={item.id}
          className={`inline-block ${colorClasses[color]} ${sizeClasses[size]} rounded-full whitespace-nowrap`}
          title={item.name}
        >
          {item.name}
        </span>
      ))}
    </div>
  );
}
