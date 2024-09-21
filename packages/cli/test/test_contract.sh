#!/bin/bash
set -e

timestamp=$(date +%s)
contract=test-contract-$timestamp-c.testnet
testaccount=test-contract-$timestamp-t.testnet

echo Creating account
./bin/near create $contract --useFaucet
./bin/near create $testaccount --useFaucet

echo Deploying contract
./bin/near deploy $contract ./test/res/guest_book.wasm

echo Calling functions
./bin/near call $contract addMessage '{"text":"TEST"}' --accountId $testaccount > /dev/null

RESULT=$(./bin/near view $contract getMessages '{}')
TEXT=$RESULT
EXPECTED='TEST'
if [[ ! $TEXT =~ .*$EXPECTED.* ]]; then
    echo FAILURE Unexpected output from near call: $RESULT
    exit 1
fi

# base64-encoded '{"message":"BASE64ROCKS"}'
./bin/near call $contract addMessage --base64 'eyJ0ZXh0IjoiVEVTVCJ9' --accountId $testaccount > /dev/null

RESULT=$(./bin/near view $contract getMessages '{}')
# TODO: Refactor asserts
TEXT=$RESULT
echo $RESULT
EXPECTED="[ { premium: false, sender: 'test.near', text: 'TEST' }, { premium: false, sender: 'test.near', text: 'TEST' } ]"
if [[ ! $TEXT =~ .*$EXPECTED.* ]]; then
    echo FAILURE Unexpected output from near call: $RESULT
    exit 1
fi
