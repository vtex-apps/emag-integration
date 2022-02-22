import React from "react";
import type { StyleProp } from "@vtex/admin-ui";
import { useDropdownState, Dropdown } from "@vtex/admin-ui";

interface DropdownProps {
  items: { id: string; label: string }[];
  initialItem: { id: string; label: string };
  label: string;
  onChange: (value: { id: string; label: string }) => void;
  csx?: StyleProp;
}

const DropdownComponent: React.FC<DropdownProps> = ({
  items,
  initialItem,
  label,
  onChange,
}) => {
  const dropdownState = useDropdownState({
    items: items,
    initialSelectedItem: initialItem,
    onSelectedItemChange: (changes: any) => {
      onChange(changes.selectedItem);
    },
  });
  return (
    <Dropdown
      items={items}
      state={dropdownState}
      label={label}
      renderItem={(item) => item?.label || ""}
    />
  );
};

export default DropdownComponent;
