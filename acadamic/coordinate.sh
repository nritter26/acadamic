#!/bin/bash
# 5-Agent coordination system
# Source this file: source ./coordinate.sh
# Requires: WORKER_ID env var (Devin, AgentB, AgentC, AgentD, AgentE)

COORD_FILE=".coordination.json"
LOCK_FILE="${COORD_FILE}.lock"

if [ -z "$WORKER_ID" ]; then
  echo "ERROR: Set WORKER_ID first (e.g. export WORKER_ID=AgentB)"
  return 1
fi

_valid_workers() {
  case "$WORKER_ID" in
    Devin|AgentB|AgentC|AgentD|AgentE) return 0 ;;
    *) echo "ERROR: WORKER_ID must be Devin, AgentB, AgentC, AgentD, or AgentE"; return 1 ;;
  esac
}
_valid_workers || return 1

claim() {
  local task_id
  (
    flock -x 200 || exit 1
    local data=$(cat "$COORD_FILE" 2>/dev/null)
    if [ -z "$data" ]; then
      echo "ERROR: $COORD_FILE not found"
      exit 1
    fi

    # Collect files from all non-completed tasks
    local inprog_files=$(echo "$data" | python3 -c "
import json, sys
data = json.load(sys.stdin)
busy_files = set()
for t in data['tasks']:
    if t['status'] in ('claimed', 'in_progress'):
        busy_files.update(t.get('files', []))
# Find first pending task with no file conflicts
for t in data['tasks']:
    if t['status'] == 'pending':
        t_files = set(t.get('files', []))
        if not t_files.intersection(busy_files):
            print(t['id'])
            break
")

    if [ -z "$inprog_files" ]; then
      echo "No available tasks (all pending tasks have file conflicts or none exist)"
      exit 0
    fi

    task_id="$inprog_files"

    # Update the task
    echo "$data" | python3 -c "
import json, sys
data = json.load(sys.stdin)
for t in data['tasks']:
    if t['id'] == '$task_id':
        t['status'] = 'claimed'
        t['claimed_by'] = '$WORKER_ID'
        break
print(json.dumps(data, indent=2))
" > "$COORD_FILE"

    echo "$WORKER_ID claimed $task_id"
  ) 200>"$LOCK_FILE"
}

start() {
  (
    flock -x 200 || exit 1
    local data=$(cat "$COORD_FILE" 2>/dev/null)
    if [ -z "$data" ]; then
      echo "ERROR: $COORD_FILE not found"
      exit 1
    fi

    local result=$(echo "$data" | python3 -c "
import json, sys
data = json.load(sys.stdin)
for t in data['tasks']:
    if t['claimed_by'] == '$WORKER_ID' and t['status'] == 'claimed':
        t['status'] = 'in_progress'
        t['branch'] = '$WORKER_ID/' + t['id']
        print(json.dumps({'id': t['id'], 'branch': t['branch'], 'new_data': json.dumps(data)}))
        break
")

    if [ -z "$result" ]; then
      echo "No claimed task found for $WORKER_ID. Run 'claim' first."
      exit 0
    fi

    local id=$(echo "$result" | python3 -c "import json,sys; r=json.load(sys.stdin); print(r['id'])")
    local branch=$(echo "$result" | python3 -c "import json,sys; r=json.load(sys.stdin); print(r['branch'])")
    local new_data=$(echo "$result" | python3 -c "import json,sys; r=json.load(sys.stdin); print(r['new_data'])")
    echo "$new_data" > "$COORD_FILE"

    echo "$WORKER_ID started $id"
    echo "  Next: git checkout -b $branch"
  ) 200>"$LOCK_FILE"
}

finish() {
  local summary="${1:-Completed}"
  (
    flock -x 200 || exit 1
    local data=$(cat "$COORD_FILE" 2>/dev/null)
    if [ -z "$data" ]; then
      echo "ERROR: $COORD_FILE not found"
      exit 1
    fi

    local result=$(echo "$data" | python3 -c "
import json, sys
data = json.load(sys.stdin)
for t in data['tasks']:
    if t['claimed_by'] == '$WORKER_ID' and t['status'] == 'in_progress':
        t['status'] = 'completed'
        t['result'] = '$summary'
        print(json.dumps({'id': t['id'], 'branch': t['branch'], 'files': t.get('files', []), 'new_data': json.dumps(data)}))
        break
")

    if [ -z "$result" ]; then
      echo "No in-progress task found for $WORKER_ID"
      exit 0
    fi

    local id=$(echo "$result" | python3 -c "import json,sys; r=json.load(sys.stdin); print(r['id'])")
    local branch=$(echo "$result" | python3 -c "import json,sys; r=json.load(sys.stdin); print(r['branch'])")
    local files=$(echo "$result" | python3 -c "import json,sys; r=json.load(sys.stdin); print(' '.join(r['files']))")
    local new_data=$(echo "$result" | python3 -c "import json,sys; r=json.load(sys.stdin); print(r['new_data'])")
    echo "$new_data" > "$COORD_FILE"

    echo "$WORKER_ID completed $id"
    echo "  Next:"
    echo "    git add $files"
    echo "    git commit -m \"$branch: $summary\""
    echo "    git checkout main && git pull && git merge $branch"
  ) 200>"$LOCK_FILE"
}

status() {
  if [ ! -f "$COORD_FILE" ]; then
    echo "No coordination file found."
    return
  fi
  python3 -c "
import json
with open('$COORD_FILE') as f:
    data = json.load(f)
print('Plan:', data.get('plan', 'N/A'))
print()
print(f'{\"Task\":<20} {\"Status\":<15} {\"Agent\":<12} {\"Files\":<30} Result')
print('-'*90)
for t in data['tasks']:
    print(f'{t[\"id\"]:<20} {t[\"status\"]:<15} {str(t.get(\"claimed_by\",\"\")):<12} {\" \".join(t.get(\"files\",[])):<30} {t.get(\"result\") or \"\"}')
print()
completed = sum(1 for t in data['tasks'] if t['status'] == 'completed')
total = len(data['tasks'])
print(f'Progress: {completed}/{total} tasks completed')
"
}
