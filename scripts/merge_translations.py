#!/usr/bin/env python3
"""
Merge Thai translations back into _th.json files.
Reads the extracted English texts and a Thai translations file,
then generates all backend/node/content/*_th.json files.

Usage: python scripts/merge_translations.py [--input translations/th_texts.json]
"""

import json
import os
import glob
import re
from pathlib import Path
from copy import deepcopy

CONTENT_DIR = Path("backend/node/content")
TRANSLATIONS_DIR = Path("translations")
DEFAULT_TRANSLATIONS = TRANSLATIONS_DIR / "th_texts.json"

# Fields that contain user-facing text (NOT code/syntax)
TEXT_FIELDS = {"exp", "prompt", "explanation", "hint"}


def parse_json_path(path_str):
    """Parse a JSON path string like 'sections[key].items[0].exp' into
    a list of keys/indices for traversal."""
    parts = []
    current = ""
    i = 0
    while i < len(path_str):
        c = path_str[i]
        if c == '.':
            if current:
                parts.append(current)
                current = ""
        elif c == '[':
            if current:
                parts.append(current)
                current = ""
            # Extract index/key inside brackets
            bracket_content = ""
            i += 1
            while i < len(path_str) and path_str[i] != ']':
                bracket_content += path_str[i]
                i += 1
            # Try to parse as integer for list index
            try:
                parts.append(int(bracket_content))
            except ValueError:
                # It's a string key (e.g., for dict access)
                # Remove quotes if present
                bracket_content = bracket_content.strip("'\"")
                parts.append(bracket_content)
        else:
            current += c
        i += 1
    if current:
        parts.append(current)
    return parts


def set_value_at_path(data, path_parts, value):
    """Set a value in nested dict/list structure at the given path."""
    current = data
    for i, part in enumerate(path_parts):
        if i == len(path_parts) - 1:
            if isinstance(part, int):
                if isinstance(current, list) and part < len(current):
                    current[part] = value
            else:
                if isinstance(current, dict) and part in current:
                    current[part] = value
            return
        else:
            if isinstance(part, int):
                if isinstance(current, list) and part < len(current):
                    current = current[part]
                else:
                    return  # Path doesn't exist
            else:
                if isinstance(current, dict) and part in current:
                    current = current[part]
                else:
                    return  # Path doesn't exist


def get_value_at_path(data, path_parts):
    """Get a value from nested dict/list at the given path."""
    current = data
    for part in path_parts:
        if isinstance(part, int):
            if isinstance(current, list) and part < len(current):
                current = current[part]
            else:
                return None
        else:
            if isinstance(current, dict) and part in current:
                current = current[part]
            else:
                return None
    return current


def count_text_entries(data, path=""):
    """Count how many translatable text entries are in the data."""
    count = 0
    if isinstance(data, dict):
        if "exp" in data:
            count += 1
        for key, value in data.items():
            if key in TEXT_FIELDS and isinstance(value, str):
                count += 1
            elif isinstance(value, (dict, list)) and key not in ("code", "expected"):
                count += count_text_entries(value, f"{path}.{key}")
    elif isinstance(data, list):
        # Array format: first element is explanation text
        if len(data) >= 2 and isinstance(data[0], str) and isinstance(data[1], str):
            count += 1
            if len(data) >= 3 and isinstance(data[2], list):
                for ex in data[2]:
                    count += count_text_entries(ex)
        else:
            for item in data:
                if isinstance(item, (dict, list)):
                    count += count_text_entries(item)
    return count


def main():
    TRANSLATIONS_DIR.mkdir(parents=True, exist_ok=True)
    
    if not DEFAULT_TRANSLATIONS.exists():
        print(f"❌ Translation file not found: {DEFAULT_TRANSLATIONS}")
        print("   Run extract_translations.py first, then provide translations.")
        return

    with open(DEFAULT_TRANSLATIONS, "r", encoding="utf-8") as f:
        translations = json.load(f)

    if "texts" not in translations:
        print("❌ Invalid translation format. Expected key: 'texts'")
        return

    text_translations = translations.get("texts", {})
    # References are not translated

    files = sorted(glob.glob(str(CONTENT_DIR / "*.json")))
    total_entries = 0
    total_files = 0
    errors = []

    for filepath in files:
        filename = os.path.basename(filepath)
        if filename.endswith("_th.json"):
            continue

        if filename not in text_translations:
            continue

        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)

        th_data = deepcopy(data)
        entries = text_translations[filename]
        applied = 0

        for entry in entries:
            path_str, english_text = entry
            # If entry has 3 elements, third is the Thai translation
            if len(entry) < 3:
                continue
            thai_text = entry[2]

            # Skip if Thai text is empty or same as English
            if not thai_text or thai_text == english_text:
                continue

            path_parts = parse_json_path(path_str)
            current_value = get_value_at_path(th_data, path_parts)
            if current_value == english_text:
                set_value_at_path(th_data, path_parts, thai_text)
                applied += 1
            else:
                errors.append(f"  {filename}: path mismatch at {path_str}")
                errors.append(f"    Expected: '{english_text[:50]}...'")
                errors.append(f"    Found: '{str(current_value)[:50]}...'")

        if applied > 0:
            th_filename = filename.replace(".json", "_th.json")
            th_filepath = CONTENT_DIR / th_filename
            with open(th_filepath, "w", encoding="utf-8") as f:
                json.dump(th_data, f, ensure_ascii=False, indent=2)
            total_entries += applied
            total_files += 1
            total_in_file = count_text_entries(th_data)
            print(f"  ✅ {th_filename}: {applied}/{total_in_file} translations applied")

    print(f"\n✅ Merge complete!")
    print(f"   Files generated: {total_files}")
    print(f"   Translations applied: {total_entries}")
    if errors:
        print(f"\n⚠️  Warnings ({len(errors)}):")
        for err in errors[:10]:
            print(err)
        if len(errors) > 10:
            print(f"   ... and {len(errors)-10} more")

    # Check for untranslated files
    untranslated = []
    for filepath in files:
        filename = os.path.basename(filepath)
        if filename.endswith("_th.json") or filename == "curriculum.json":
            continue
        th_filename = filename.replace(".json", "_th.json")
        if not (CONTENT_DIR / th_filename).exists():
            untranslated.append(filename)
    if untranslated:
        print(f"\n⚠️  Untranslated files ({len(untranslated)}):")
        for f in untranslated[:10]:
            print(f"   - {f}")
        if len(untranslated) > 10:
            print(f"   ... and {len(untranslated)-10} more")


if __name__ == "__main__":
    main()
