#!/bin/bash

LOG_DIR=~/workspace
CLIENT_LOG_DIR=~/workspace

CLIENT_URL=grillo@10.62.9.12
CLIENT_PATH=~/workspace/ajaxChat

NUM_EXPERIMENTS=1
((TOTAL_EXPERIMENTS=($NUM_EXPERIMENTS*8)))

function log {
    echo [ `date '+%d/%m/%Y %X'` ] $1
}

function get_time {
    date --utc --date "$(date '+%Y-%m-%d %H:%M:%S')" +%s
}

if [ ! -d $LOG_DIR ]; then
    echo "No log dir found"
    exit 1
fi

COUNTER=1
EXPERIMENT_COUNTER=1
GLOBAL_START_TIME=$(get_time)

#Message size
for ms in 50 100; do
    # Client number
    for cn in 2 4; do
        #Behavior (random or regular)
        for be in 0 1; do
            for((i=1; i<=$NUM_EXPERIMENTS; i++)); do
                log "Starting experiment $COUNTER of $TOTAL_EXPERIMENTS"
                START_TIME=$(get_time) 

                #Start the server
                node holychat.js > $LOG_DIR"/server_aj_"$EXPERIMENT_COUNTER"_"$i"_"$ms"_"$cn"_"$be".csv" &
                SERVER_PID=$!
		
		sleep 2
                
                #Start the client remotely
                ssh $CLIENT_URL "cd $CLIENT_PATH && node benchmark.js $cn 5 $ms 200 400 $be > $CLIENT_LOG_DIR/client_aj_"$EXPERIMENT_COUNTER"_"$i"_"$ms"_"$cn"_"$be".csv"
		sleep 2
                END_TIME=$(get_time) 

                #Kill the server
                kill $SERVER_PID
                sleep 2
                ((TOTAL_TIME=($END_TIME-$START_TIME)))
                log "Execution time: $TOTAL_TIME seconds"
                let COUNTER++
            done
	    let EXPERIMENT_COUNTER++
        done
    done
done
GLOBAL_END_TIME=$(get_time)
((GLOBAL_TOTAL_TIME=($GLOBAL_END_TIME-$GLOBAL_START_TIME)))
log "======= TOTAL EXECUTION TIME: $GLOBAL_TOTAL_TIME"
