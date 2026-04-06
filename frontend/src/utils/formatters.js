/**
 * Formats a number or string with thousands separators (spaces).
 * Example: 1000000 -> "1 000 000"
 */
export const formatPrice = (value) => {
  if (value === undefined || value === null || value === "") return "";
  
  // Convert to string and remove any existing non-digit characters (except dot for decimals)
  const stringValue = value.toString().replace(/\s/g, "");
  
  // Split integer and decimal parts
  const [integerPart, decimalPart] = stringValue.split(".");
  
  // Add spaces as thousands separators
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  
  return decimalPart !== undefined ? `${formattedInteger}.${decimalPart}` : formattedInteger;
};

/**
 * Removes thousands separators (spaces) and returns a clean numeric string.
 * Example: "1 000 000" -> "1000000"
 */
export const unformatPrice = (str) => {
  if (typeof str !== "string") return str;
  return str.replace(/\s/g, "");
};
