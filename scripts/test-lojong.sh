#!/bin/sh
set -eu
lojong_test_dir=$(mktemp -d "${TMPDIR:-/tmp}/lojong-tests.XXXXXX")
trap 'rm -rf "$lojong_test_dir"' EXIT
./node_modules/.bin/tsc lib/lojong/curriculum.ts lib/lojong/questions.ts lib/lojong/engine.ts lib/lojong/storage.ts lib/lojong/practice.ts --outDir "$lojong_test_dir" --module commonjs --target es2022 --skipLibCheck --strict
LOJONG_COMPILED_DIR="$lojong_test_dir" node --test tests/lojong/engine.test.mjs
