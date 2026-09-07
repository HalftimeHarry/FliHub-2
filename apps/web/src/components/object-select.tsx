import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select.js';

export interface ObjectSelectOption {
  readonly id: string;
  readonly label: string;
}

export function ObjectSelect({
  id,
  value,
  onValueChange,
  options,
  placeholder,
  disabled = false,
  className
}: {
  readonly id: string;
  readonly value: string;
  readonly onValueChange: (value: string) => void;
  readonly options: readonly ObjectSelectOption[];
  readonly placeholder: string;
  readonly disabled?: boolean;
  readonly className?: string;
}) {
  return (
    <Select value={value || undefined} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger id={id} className={className ?? 'w-full'}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.id} value={option.id}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}