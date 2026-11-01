"use client";

import { LanguageDropdown } from './LanguageDropdown';

// Re-export LanguageDropdown to ensure any legacy references render the clean single dropdown
export { LanguageDropdown as LanguageToggleButton };
export default LanguageDropdown;
