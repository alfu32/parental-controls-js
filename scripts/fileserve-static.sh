#!/bin/bash

PORT=$2
ROOT_DIR=$1



while true; do
  # Wait for a client to connect
  client_socket=$(nc -l $PORT)

  # Parse the HTTP request
  read -r request_line <&$client_socket
  method=$(echo $request_line | cut -d ' ' -f 1)
  path=$(echo $request_line | cut -d ' ' -f 2)

  # Serve the requested file
  if [ "$method" = "GET" ]; then
    file_path="$ROOT_DIR$path"
    if [ -f "$file_path" ]; then
      echo "HTTP/1.1 200 OK" >&$client_socket
      echo "Content-Type: $(file -b --mime-type $file_path)" >&$client_socket
      echo >&$client_socket
      cat $file_path >&$client_socket
    else
      echo "HTTP/1.1 404 Not Found" >&$client_socket
      echo >&$client_socket
      echo "404 Not Found" >&$client_socket
    fi
  fi

  # Close the client socket
  exec >&-
done
