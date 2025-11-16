#!/bin/bash

# Test set_database with no filename (should use default)
echo 'Test 1: Default path'
bun run -e "import tool from './tool/key-value-store.ts'; tool.execute({action: 'set_database'}, {} ).then(console.log)"

# Test set_database with a directory only
echo 'Test 2: Directory only'
mkdir -p /tmp/kvtestdir
bun run -e "import tool from './tool/key-value-store.ts'; tool.execute({action: 'set_database', filename: '/tmp/kvtestdir/'}, {} ).then(console.log)"

# Test set_database with directory + filename
echo 'Test 3: Directory + filename'
bun run -e "import tool from './tool/key-value-store.ts'; tool.execute({action: 'set_database', filename: '/tmp/kvtestdir/mydb.sqlite'}, {} ).then(console.log)"
