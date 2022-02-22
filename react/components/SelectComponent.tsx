import React, { useEffect, useState } from "react";
import type { StyleProp } from "@vtex/admin-ui";
import { Select } from "@vtex/admin-ui";

import TooltipComponent from "./TooltipComponent";

export interface SelectProps {
  items: string[];
  initialSelectedItem: string;
  label: string;
  canEdit?: boolean;
  tooltip?: string;
  onChange: (value: string | undefined) => void;
  csx?: StyleProp;
}

const SelectComponent: React.FC<SelectProps> = ({
  initialSelectedItem,
  items,
  label,
  onChange,
  canEdit,
  tooltip,
  csx,
}: SelectProps) => {
  const [value, setValue] = useState(initialSelectedItem);

  useEffect(() => {
    setValue(initialSelectedItem);
  }, [initialSelectedItem]);

  const selectComponent = (
    <Select
      value={value}
      onChange={(e) => {
        setValue(e.target.value);
        onChange(e.target.value);
      }}
      label={label}
      disabled={!canEdit ?? false}
      csx={csx}
    >
      {items.map((item: string) => (
        <option value={item}>{item}</option>
      ))}
    </Select>
  );

  return (
    <TooltipComponent placement="left" label={tooltip}>
      {selectComponent}
    </TooltipComponent>
  );
};

export default SelectComponent;
