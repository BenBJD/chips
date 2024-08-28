#!/bin/bash

serve -s dist -l 3000 &

npm run dev -w server &

wait -n

exit $?