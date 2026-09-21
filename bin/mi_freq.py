#!/usr/bin/env python3
"""Aggregate first-name frequencies by first letter for middle-initial weighting."""
import csv
from collections import defaultdict
from pathlib import Path

SRC = Path(__file__).resolve().parent.parent / "src" / "assets" / "firstnames.csv"
DST = Path(__file__).resolve().parent.parent / "src" / "assets" / "middleinitial.csv"


def main() -> None:
    totals: dict[str, int] = defaultdict(int)
    with SRC.open(newline="", encoding="utf-8-sig") as f:
        for row in csv.reader(f):
            if not row:
                continue
            name, freq = row[0], row[1]
            totals[name[0].upper()] += int(freq)

    with DST.open("w", newline="") as f:
        writer = csv.writer(f)
        for letter in sorted(totals):
            writer.writerow([letter, totals[letter]])


if __name__ == "__main__":
    main()
