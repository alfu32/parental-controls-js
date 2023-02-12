ssh alfu64@192.168.1.27 'mkdir parental-controls'
scp ./build/parental-controls-x86_64-unknown-linux-gnu.bin alfu64@192.168.1.27:/home/alfu64/parental-controls
scp ./config.json alfu64@192.168.1.27:/home/alfu64/parental-controls
ssh alfu64@192.168.1.31 'mkdir parental-controls'
scp ./build/parental-controls-x86_64-unknown-linux-gnu.bin alfu64@192.168.1.31:/home/alfu64/parental-controls
scp ./config.json alfu64@192.168.1.31:/home/alfu64/parental-controls