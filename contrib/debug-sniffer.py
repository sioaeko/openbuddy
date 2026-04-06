#!/usr/bin/env python3
"""Debug helper: raw stdin bytes → /tmp/openbuddy_sniffer.log (TTY debugging only)."""
import sys
import os
import time
import termios
import tty

log_path = "/tmp/openbuddy_sniffer.log"
with open(log_path, "w") as f:
    f.write(f"Sniffer started at {time.ctime()}\n")
    f.flush()

    fd = sys.stdin.fileno()
    old_settings = termios.tcgetattr(fd)
    try:
        tty.setraw(fd)
        # Non-blocking read
        import fcntl
        fl = fcntl.fcntl(fd, fcntl.F_GETFL)
        fcntl.fcntl(fd, fcntl.F_SETFL, fl | os.O_NONBLOCK)

        start = time.time()
        while time.time() - start < 3.0:
            try:
                data = os.read(fd, 1024)
                if data:
                    f.write(f"RAW BYTES: {data!r}\n")
                    f.flush()
            except BlockingIOError:
                time.sleep(0.01)
    finally:
        termios.tcsetattr(fd, termios.TCSADRAIN, old_settings)

print("Sniffer finished.")
