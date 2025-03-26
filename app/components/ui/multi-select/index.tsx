import * as React from "react";
import { X } from "lucide-react";

import { cn } from "../../../lib/utils";
import { Badge } from "../badge";
import { Button } from "../button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../select";

export interface MultiSelectProps {
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select options",
  className,
  disabled = false,
}: MultiSelectProps) {
  const [selectedValues, setSelectedValues] = React.useState<string[]>(
    selected || [],
  );

  const handleSelect = (value: string) => {
    if (!selectedValues.includes(value)) {
      const newValues = [...selectedValues, value];
      setSelectedValues(newValues);
      onChange(newValues);
    }
  };

  const handleRemove = (value: string) => {
    const newValues = selectedValues.filter((v) => v !== value);
    setSelectedValues(newValues);
    onChange(newValues);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap gap-1">
        {selectedValues.map((value) => {
          const option = options.find((o) => o.value === value);
          return (
            <Badge key={value} variant="secondary">
              {option?.label || value}
              <Button
                variant="ghost"
                size="sm"
                className="ml-1 h-auto p-0"
                onClick={() => handleRemove(value)}
                disabled={disabled}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove {option?.label || value}</span>
              </Button>
            </Badge>
          );
        })}
      </div>
      <Select onValueChange={handleSelect} disabled={disabled}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options
            .filter((option) => !selectedValues.includes(option.value))
            .map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
    </div>
  );
}
