CC=cc
CFLAGS=
LIBS=

TARGET = main-cli

$(TARGET): main-cli.o
	$(CC) $(LIBS) $^ -o $@

main-cli.o: main-cli.c
	$(CC) $(CFLAGS) -c $< -o $@

.PHONY: clean

clean:
	rm -f *.o $(TARGET)
