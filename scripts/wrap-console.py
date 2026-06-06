"""
Wrap bare console.log/error/warn calls with if (import.meta.env.DEV) guard.
Skips calls already guarded on the same line.
Handles single-line and multi-line calls.
"""
import re
import sys

CONSOLE_PATTERN = re.compile(r'^console\.(log|error|warn|debug|info)\s*\(')

def net_parens(line):
    depth = 0
    for ch in line:
        if ch == '(':
            depth += 1
        elif ch == ')':
            depth -= 1
    return depth


def wrap_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    result = []
    i = 0
    changes = 0

    while i < len(lines):
        line = lines[i]
        stripped = line.lstrip()
        indent_str = line[:len(line) - len(stripped)]

        # Already has a DEV guard on this line — leave it alone
        if 'import.meta.env.DEV' in line:
            result.append(line)
            i += 1
            continue

        if CONSOLE_PATTERN.match(stripped):
            # Collect all lines belonging to this call using paren depth
            call_lines = []
            depth = 0
            j = i

            while j < len(lines):
                cur = lines[j]
                call_lines.append(cur)
                depth += net_parens(cur)
                if depth <= 0:
                    break
                j += 1

            if len(call_lines) == 1:
                # Single-line: inline guard
                result.append(f'{indent_str}if (import.meta.env.DEV) {stripped}')
            else:
                # Multi-line: block guard, indent all call lines by 2 extra spaces
                result.append(f'{indent_str}if (import.meta.env.DEV) {{\n')
                for cl in call_lines:
                    result.append('  ' + cl)
                result.append(f'{indent_str}}}\n')

            changes += 1
            i = j + 1
            continue

        result.append(line)
        i += 1

    with open(filepath, 'w', encoding='utf-8') as f:
        f.writelines(result)

    return changes


if __name__ == '__main__':
    for path in sys.argv[1:]:
        n = wrap_file(path)
        print(f'  {path}: wrapped {n} console call(s)')
