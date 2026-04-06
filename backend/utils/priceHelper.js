/**
 * Safely parses a value into a float, handling strings with thousand-separator spaces
 * and decimal commas.
 * 
 * @param {any} val - The value to parse
 * @returns {number} - The parsed float or 0 if invalid
 */
const safeParseFloat = (val) => {
    if (val === undefined || val === null || val === '') return 0;
    if (typeof val === 'number') return val;
    
    // Clean spaces and replace comma with dot for standard float parsing
    const cleaned = String(val).replace(/\s/g, '').replace(',', '.');
    const parsed = parseFloat(cleaned);
    
    return isNaN(parsed) ? 0 : parsed;
};

module.exports = { safeParseFloat };
