#!/usr/bin/env python3
"""
Extract all translatable English text from all backend/node/content/*.json files.
Outputs a structured JSON mapping: file -> section -> key -> english_text.

Usage: python scripts/extract_translations.py [--output translations/en_texts.json]
"""

import json
import os
import glob
from pathlib import Path

CONTENT_DIR = Path("backend/node/content")
OUTPUT_DIR = Path("translations")
DEFAULT_OUTPUT = OUTPUT_DIR / "en_texts.json"

# Fields that contain user-facing text (NOT code/syntax)
TEXT_FIELDS = {"exp", "prompt", "explanation", "hint"}
# Fields that are code/syntax — skip
CODE_FIELDS = {"code", "expected"}


def extract_texts(data, path=""):
    """Recursively extract translatable text strings from JSON structure.
    Returns list of (json_path, text) tuples."""
    results = []

    if isinstance(data, dict):
        # Check if this is a topic entry with exp/code/exercises
        if "exp" in data and "code" in data:
            results.append((f"{path}.exp", data["exp"]))
            if "exercises" in data and isinstance(data["exercises"], list):
                for i, ex in enumerate(data["exercises"]):
                    results.extend(extract_texts(ex, f"{path}.exercises[{i}]"))
            return results

        # Regular dict — check each key
        for key, value in data.items():
            child_path = f"{path}.{key}"
            if key in TEXT_FIELDS and isinstance(value, str):
                results.append((child_path, value))
            elif key in CODE_FIELDS:
                pass  # Skip code fields
            elif isinstance(value, (dict, list)):
                results.extend(extract_texts(value, child_path))

    elif isinstance(data, list):
        # Check if it's an array-format topic: [exp, code, exercises?] or [exp, code, exercises?, ref?]
        # Key discriminator: topic entries have a long explanation string (>20 chars) as first element,
        # code as second element, and optionally a list of exercises as third element.
        # This avoids matching exercise 'options' arrays (which are all strings, no nested list).
        is_topic_entry = (
            len(data) >= 2 and 
            isinstance(data[0], str) and isinstance(data[1], str) and
            len(data[0]) > 20 and  # explanations are long; options are short
            (len(data) == 2 or isinstance(data[2], list))  # 3rd element (if exists) must be a list
        )
        
        if is_topic_entry:
            # Array format: first element is explanation text
            results.append((f"{path}[0]", data[0]))
            # Check for exercises at index 2
            if len(data) >= 3 and isinstance(data[2], list):
                for i, ex in enumerate(data[2]):
                    results.extend(extract_texts(ex, f"{path}[2][{i}]"))
            # Reference at index 3 (string like "Functions::Function Declarations") — skip, not translatable
            return results

        # Regular list — recurse into each item
        for i, item in enumerate(data):
            child_path = f"{path}[{i}]"
            if isinstance(item, str):
                results.append((child_path, item))
            elif isinstance(item, (dict, list)):
                results.extend(extract_texts(item, child_path))

    return results


def extract_reference_texts(data, path=""):
    """Extract just the reference string entries (like 'Functions::Function Declarations')
    from array-formatted topics where index 3 is a reference string."""
    results = []
    if isinstance(data, dict):
        for key, value in data.items():
            child_path = f"{path}.{key}"
            if isinstance(value, (dict, list)):
                results.extend(extract_reference_texts(value, child_path))
    elif isinstance(data, list):
        # Array format topic with reference string at index 3
        # Use same heuristic as extract_texts to detect topic entries
        is_topic_entry = (
            len(data) >= 2 and 
            isinstance(data[0], str) and isinstance(data[1], str) and
            len(data[0]) > 20 and
            (len(data) == 2 or isinstance(data[2], list))
        )
        if is_topic_entry and len(data) >= 4 and isinstance(data[3], str):
            results.append((f"{path}[3]", data[3]))
        else:
            for i, item in enumerate(data):
                child_path = f"{path}[{i}]"
                if isinstance(item, (dict, list)):
                    results.extend(extract_reference_texts(item, child_path))
    return results


def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    all_texts = {}
    all_refs = {}

    files = sorted(glob.glob(str(CONTENT_DIR / "*.json")))
    print(f"Found {len(files)} content files to process")

    for filepath in files:
        filename = os.path.basename(filepath)
        # Skip already-translated files
        if filename.endswith("_th.json"):
            continue
        # Skip curriculum.json (separate handling due to size)
        # Actually include it
        if filename.endswith("curriculum.json"):
            print(f"  Including: {filename} (large file)")

        try:
            with open(filepath, "r", encoding="utf-8") as f:
                data = json.load(f)
        except json.JSONDecodeError as e:
            print(f"  ERROR parsing {filename}: {e}")
            continue

        texts = extract_texts(data)
        refs = extract_reference_texts(data)

        if texts:
            all_texts[filename] = [(path, text) for path, text in texts]
            print(f"  {filename}: {len(texts)} text entries extracted")
        if refs:
            all_refs[filename] = [(path, ref) for path, ref in refs]

    # Save all texts
    output = {
        "texts": {fn: items for fn, items in all_texts.items()},
        "references": {fn: items for fn, items in all_refs.items()},
    }
    with open(DEFAULT_OUTPUT, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    total_texts = sum(len(items) for items in all_texts.values())
    total_refs = sum(len(items) for items in all_refs.values())
    print(f"\n✅ Extraction complete!")
    print(f"   Files processed: {len(all_texts)}")
    print(f"   Text entries extracted: {total_texts}")
    print(f"   Reference entries: {total_refs}")
    print(f"   Output: {DEFAULT_OUTPUT}")


if __name__ == "__main__":
    main()
