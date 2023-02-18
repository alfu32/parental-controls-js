#!/bin/bash

## Create the response FIFO
rm -f response
mkfifo response

function handle_GET_home() {
  RESPONSE=$(cat home.html | \
    sed "s/{{$COOKIE_NAME}}/$COOKIE_VALUE/")
}

function handle_GET_login() {
  RESPONSE=$(cat login.html)
}

function handle_POST_login() {
  RESPONSE=$(cat post-login.http | \
    sed "s/{{cookie_name}}/$INPUT_NAME/" | \
    sed "s/{{cookie_value}}/$INPUT_VALUE/")
}

function handle_POST_logout() {
  RESPONSE=$(cat post-logout.http | \
    sed "s/{{cookie_name}}/$COOKIE_NAME/" | \
    sed "s/{{cookie_value}}/$COOKIE_VALUE/")
}

function handle_not_found() {
  A=$0
  req=$1
  path=$2
  fpath="$ROOT_FOLDER$path"
  if [ -f "$fpath" ];then
  RESPONSE="HTTP/1.1 200
Requested-Path: $path [$fpath]
Content-Length: $(wc -c < $fpath)

$(cat $fpath)
"
  else
  RESPONSE="HTTP/1.1 404
Content-Type: text/plain
Content-Length: 10
Requested-Path: $path

$path not found
"
fi
}

function handleRequest() {
  ## Read the HTTP request until \r\n
  local LINENUM=1
  while read line; do
    trline=$(echo $line | tr -d '[\r\n]') ## Removes the \r\n from the EOL

    ## Breaks the loop when line is empty
    [ -z "$trline" ] && break

    ## Parses the headline
    ## e.g GET /login HTTP/1.1 -> GET /login
    ##if [ "$LINE" == "1" ];then
      echo $line
      HEADLINE_REGEX='(.*?)\s(.*?)\sHTTP.*?'
      [[ "$trline" =~ $HEADLINE_REGEX ]] &&
        REQUEST=$(echo $trline | sed -E "s/$HEADLINE_REGEX/\1 \2/")
      PATH_REGEX='^(.*?)\s(.*?)$'
      [[ "$REQUEST" =~ $PATH_REGEX ]] &&
        REQ_PATH=$(echo $REQUEST | sed -E "s/$PATH_REGEX/\2/")
    ##fi
    ## Parses the Content-Length header
    ## e.g Content-Length: 42 -> 42
    CONTENT_LENGTH_REGEX='Content-Length:\s(.*?)'
    [[ "$trline" =~ $CONTENT_LENGTH_REGEX ]] &&
      CONTENT_LENGTH=$(echo $trline | sed -E "s/$CONTENT_LENGTH_REGEX/\1/")

    ## Parses the Cookie header
    ## e.g Cookie: name=John -> name John
    COOKIE_REGEX='Cookie:\s(.*?)\=(.*?).*?'
    [[ "$trline" =~ $COOKIE_REGEX ]] &&
      read COOKIE_NAME COOKIE_VALUE <<< $(echo $trline | sed -E "s/$COOKIE_REGEX/\1 \2/")
    LINENUM=$(($LINENUM + 1))
  done

  ## Read the remaining HTTP request body
  if [ ! -z "$CONTENT_LENGTH" ]; then
    BODY_REGEX='(.*?)=(.*?)'

    while read -n$CONTENT_LENGTH -t1 line; do
      echo $line
      trline=`echo $line | tr -d '[\r\n]'`

      [ -z "$trline" ] && break

      read INPUT_NAME INPUT_VALUE <<< $(echo $trline | sed -E "s/$BODY_REGEX/\1 \2/")
    done
  fi

  ## Route request to the response handler
  case "$REQUEST" in
    "GET /login")   handle_GET_login ;;
    "GET /")        handle_GET_home ;;
    "POST /login")  handle_POST_login ;;
    "POST /logout") handle_POST_logout ;;
    *)              handle_not_found "$REQUEST" "$REQ_PATH";;
  esac

  echo -e "$RESPONSE" > response
}

ROOT_FOLDER=$1
PORT=$2

echo "Listening on $PORT ..."

## Keep the server running forever
while true; do
  ## 1. wait for FIFO
  ## 2. creates a socket and listens to the port 3000
  ## 3. as soon as a request message arrives to the socket, pipes it to the handleRequest function
  ## 4. the handleRequest function processes the request message and routes it to the response handler, which writes to the FIFO
  ## 5. as soon as the FIFO receives a message, it's sent to the socket
  ## 6. closes the connection (`-N`), closes the socket and repeat the loop
  cat response | nc -lN $PORT | handleRequest
done
