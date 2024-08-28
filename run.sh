#!/bin/bash

npx serve -s packages/client/dist -l 3000 &

npm run dev -w server &

wait -n

exit $?