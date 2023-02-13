#!/bin/bash
CDIR=`pwd`
export HOME=/home/devlin
export SERVICE_HOME=$HOME/Development/000-parental-controls

cd $SERVICE_HOME
CSV_HEADER="app-id,process-grep-regex,allowed-time-minutes,used-time-minutes"
mkdir -p logs counters
if [ ! -f config.csv ]; then
    echo $CSV_HEADER > config.csv
fi

while true
do
    DS=`date +'%Y%m%d%H%M%S'`
    LOGDATE=`date +'%Y/%m'`
    PREFIX=`date +'%Y/%m/%d'`
    logs="logs/$LOGDATE"
    counters="counters/$LOGDATE"
    LOG="logs/$PREFIX.log"
    COUNTERS="counters/$PREFIX.counter"
    mkdir -p $logs
    mkdir -p $counters
    echo "ping">$LOG
    echo "--- start $DS -------------------------------------------------"

    if [ ! -f $COUNTERS ]; then
        cp config.csv $COUNTERS
    fi
    declare -a config

    while read line; do
        config+=("$line")
    done < config.csv

    declare -a counters

    while read line; do
        counters+=("$line")
    done < $COUNTERS
    
    INDEX=0
    echo "ALL CONFIG   : [${config[@]}]"
    echo "ALL COUNTERS : [${counters[@]}]"
    for line in "${config[@]}";do
        if [ "$line" != "$CSV_HEADER" -a "$line" != "" ];then
            echo "config_line : [$line]"
            echo "counter_line: [${counters[$((INDEX+1))]}]"
            IFS=',' read -r -a cfg <<< "$line"
            IFS=',' read -r -a use <<< "${counters[$INDEX]}"
            APPID=${cfg[0]}
            GREPEX=${cfg[1]}
            ALLOWED=${cfg[2]}
            USED=${use[3]}
            echo "APPID:$APPID"
            echo "GREPEX:$GREPEX"
            echo "ALLOWED:$ALLOWED"
            echo "USED:$USED"
            line_count=$(echo -n "$(ps -aux | grep "$GREPEX")" | tr -cd '\n' | wc -c)
            echo "found $line_count"
            if [ $((line_count)) -gt 1 ];then
                echo "counting 1 minute of $GREPEX"
                use[3]=$((${use[3]}+1))
                else
                echo "not counting 1 minute of $GREPEX"
            fi
            USED=${use[3]}
        fi
        INDEX=$((INDEX + 1))
    done
    ### while read line; do
    ###     if [ "$line" != "$CSV_HEADER" -a "$line" != "" ];then
    ###         IFS=',' read -r -a array <<< "$line"
    ###         GREP=${array[0]}
    ###         COUNT=${array[1]}
    ###         echo "grep:$GREP"
    ###         echo "count:$COUNT"
    ###         line_count=$(echo -n "$(ps -aux | grep "$GREP")" | tr -cd '\n' | wc -c)
    ###         echo "found $line_count"
    ###         if [ $((line_count)) -gt 1 ];then
    ###             echo "counting 1 minute of $GREP"
    ###             else
    ###             echo "not counting 1 minute of $GREP"
    ###         fi
    ###         echo "$line"
    ###     fi
    ### done < config.csv
    echo "--- end $DS -------------------------------------------------"
    sleep 60
done

cd $CDIR