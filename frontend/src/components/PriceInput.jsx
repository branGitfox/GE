import React from "react";
import { formatPrice, unformatPrice } from "../utils/formatters";

/**
 * A reusable input component that formats prices as the user types.
 * 
 * Props:
 * - value: The numeric value (string or number)
 * - onChange: Handler called with a synthetic-like event { target: { name, value: unformattedValue } }
 * - name: Input name
 * - className: CSS classes
 * - placeholder: Input placeholder
 * - required: Is field required
 * - disabled: Is field disabled
 */
const PriceInput = ({ 
  value, 
  onChange, 
  name, 
  className, 
  placeholder, 
  required = false, 
  disabled = false 
}) => {
  
  const handleInputChange = (e) => {
    const rawValue = e.target.value;
    
    // Only allow digits, spaces, and one dot for decimals
    // Remove characters that are not digits or dot
    const cleanValue = rawValue.replace(/[^\d\s.]/g, "");
    
    // Unformat to get the numeric value
    const numericValue = unformatPrice(cleanValue);
    
    // Trigger the original onChange with a synthetic event structure
    if (onChange) {
      onChange({
        target: {
          name,
          value: numericValue
        }
      });
    }
  };

  return (
    <input
      type="text"
      name={name}
      value={formatPrice(value)}
      onChange={handleInputChange}
      className={className}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      inputMode="numeric" // Optimize mobile keyboard
    />
  );
};

export default PriceInput;
