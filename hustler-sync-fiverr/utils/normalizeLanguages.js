const normalizeLanguages = (languages) => {
  try {
    // 1. If empty or undefined → return empty array
    if (!languages) return [];

    // 2. If already array (rare in FormData but safe)
    if (Array.isArray(languages)) {
      return languages.map((l) => String(l).trim()).filter(Boolean);
    }

    // 3. If string from FormData: try JSON.parse first
    if (typeof languages === "string") {
      try {
        const parsed = JSON.parse(languages); // if "[\"Hindi\",\"English\"]"
        if (Array.isArray(parsed)) {
          return parsed.map((l) => String(l).trim()).filter(Boolean);
        }
      } catch (err) {
        // Parsing failed → fallback to comma-separated format
        return languages
          .split(",")
          .map((l) => l.trim())
          .filter(Boolean);
      }
    }

    // Final fallback
    return [];
  } catch (err) {
    console.error("Error normalizing languages:", err);
    return [];
  }
};

module.exports = { normalizeLanguages };
