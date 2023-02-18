#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>

int main(int argc, char *argv[]) {
    if (argc < 3) {
        fprintf(stderr, "Usage: %s <sleep_time> <message>\n", argv[0]);
        return 1;
    }

    int sleep_time = atoi(argv[1]);
    char *message = argv[2];

    while (1) {
        printf("%s\n", message);
        sleep(sleep_time);
    }

    return 0;
}