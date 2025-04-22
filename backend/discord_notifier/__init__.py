
import sys, os
sys.path.insert(0, os.path.abspath('..'))

import database as db
import multiprocessing
import asyncio
import os
import re
import time
import json
import threading
import requests
from typing import Optional
from logger import logger, get_logfile_path

class existingProcess:
    def __init__(self, process, webhook_url):
        self.process = process
        self.webhook_url = webhook_url
    # Override __eq__ and __hash__ to allow for comparison of existingProcess objects, so duplicates are not added to the list
    def __eq__(self, other):
        return self.webhook_url == other.webhook_url
    def __hash__(self):
        return hash(self.webhook_url)
    # Get the process object
    def get_process(self):
        return self.process

class LogMonitor:
    def __init__(self, poll_interval: float = 2.5, db_session=None):
        self.logfile_path = get_logfile_path()
        self.poll_interval = poll_interval
        self.processes = []
        self.db_session = db_session
        self.enabled = True
        # self._stop_event = threading.Event()

    def toggle(self):
        """Flip enabled on/off."""
        self.enabled = not self.enabled
        state = "ENABLED" if self.enabled else "DISABLED"
        logger.info(f"[LogMonitor] Toggling to {state}")

    def _post_embed(self, embed: dict, webhook_url: str = None):
        payload = {"embeds": [embed]}
        try:
            if webhook_url is None:
                raise ValueError("No webhook URL provided")
            resp = requests.post(webhook_url, json=payload, timeout=5)
            resp.raise_for_status()
        except Exception as e:
            logger.error(f"[LogMonitor] Failed to send webhook: {e}")

    def _parse_line(self, line: str) -> Optional[dict]:
        # INFO
        if "| INFO |" in line:
            # return ( self._system_added(line)
            #       or self._environment_added(line) )
            return self._system_stopped(line)
        # WARNING
        # if "| WARNING |" in line:
        #     return self._warning(line)
        # ERROR
        # if "| ERROR |" in line:
        #     return self._error(line)
        return None

    def _system_stopped(self, line: str) -> Optional[dict]:
        m = re.search(r"Stopping container with env_id: ([\w\-]+)", line)
        if not m:
            return None
        env_id = m.group(1)
        return {
            "title": "System Stopped",
            "description": f"Container with env_id **{env_id}** has been stopped.",
            "color": 0xFF0000,  # red
        }

    def _system_added(self, line: str) -> Optional[dict]:
        m = re.search(r"Adding system to listing: ([\w\-]+) with (\d+) environments", line)
        if not m:
            return None
        name, envs = m.group(1), m.group(2)
        return {
            "title": "New System Added",
            "description": f"System **{name}** has been added.",
            "color": 0x800080,  # purple
            "fields": [{"name": "Environments", "value": envs, "inline": False}],
        }

    def _environment_added(self, line: str) -> Optional[dict]:
        m1 = re.search(r"Adding environment to system (\w+)", line)
        m2 = re.search(r"\{(.*?)\}", line)
        if not (m1 and m2):
            return None
        sys, raw = m1.group(1), m2.group(1)
        data = dict(item.strip().strip("'").split(":") for item in raw.split(","))
        return {
            "title": "New Environment Added",
            "description": f"A new containerized environment has been added to system **{sys}**.",
            "color": 0x800080,
            "fields": [
                {"name": "Name",         "value": data.get("name", "N/A"),         "inline": True},
                {"name": "Container ID", "value": data.get("container_id", "N/A"), "inline": True},
                {"name": "OS",           "value": data.get("os", "N/A"),            "inline": True},
                {"name": "Status",       "value": data.get("status", "N/A"),        "inline": True},
            ],
        }

    def _warning(self, line: str) -> Optional[dict]:
        m = re.match(r".*\| WARNING \| (.*)$", line)
        if not m:
            return None
        return {
            "title": "Warning",
            "description": m.group(1).strip(),
            "color": 0xFFA500,  # orange
        }

    def _error(self, line: str) -> Optional[dict]:
        m = re.match(r".*\| ERROR \| (.*)$", line)
        if not m:
            return None
        return {
            "title": "Error",
            "description": m.group(1).strip(),
            "color": 0xFF0000,  # red
        }

    def _tail_loop(self, webhook_url: str):
        # Open and seek to end
        with open(self.logfile_path, "r", encoding="utf-8") as f:
            f.seek(0, os.SEEK_END)
            # while not self._stop_event.is_set():
            while True:
                line = f.readline()
                if not line:
                    time.sleep(self.poll_interval)
                    continue

                if self.enabled:
                    embed = self._parse_line(line.strip())
                    if embed:
                        self._post_embed(embed, webhook_url=webhook_url)

    def create_processes(self):
        """
        Create a process (with its own command queue) for each connection string in the database.
        """
        notifiers = db.get_current_notifiers(self.db_session)
        if len(notifiers) == 0 and self.enabled:
            return
        for noti in notifiers:
            if noti.webhook_url is None:
                logger.warning(f"Notifier {noti.webhook_name} has no webhook URL")
                continue
            if noti.enabled:
                # Create a new process if one doesn't already exist for this connection string.
                p = multiprocessing.Process(target=self._tail_loop, args=(noti.webhook_url, ))
                existing = existingProcess(p, noti.webhook_url)
                # Check if the process already exists in the list
                if existing not in self.processes:
                    self.processes.append(existing)
            else:
                # Check if the process already exists in the list
                existing = existingProcess(None, noti.webhook_url)
                if existing in self.processes:
                    logger.info(f"Stopping notifier {noti.webhook_name} as it is disabled")
                    # Stop all processes
                    for existing_process in self.processes:
                        p = existing_process.get_process()
                        if (not p is None) and (p.is_alive()):
                            logger.info(f"Terminating process {p.pid}")
                            p.kill()
                            p.join()
                    self.processes = []

    async def run(self):
        """
        The main async loop that starts the poller processes
        """
        logger.info("Starting main loop")
        try:
            while True:
                self.create_processes()

                # Start processes that are not already alive
                for existing_process in self.processes:
                    p = existing_process.get_process()
                    if not p.is_alive():
                        p.start()

                await asyncio.sleep(self.poll_interval)
        except KeyboardInterrupt:
            self.shutdown()
            raise
        except asyncio.CancelledError:
            self.shutdown()
            raise
        except Exception as e:
            logger.error(f"[LogMonitor] Exception in main loop: {e}")
            self.shutdown()
            raise
        finally:
            logger.info("[LogMonitor] Main loop exited")
            self.shutdown()

    def shutdown(self):
        """
        Terminate all processes and clean up.
        """
        if self.main_task and not self.main_task.done():
            self.main_task.cancel()
        for existing_process in self.processes:
            p = existing_process.get_process()
            if (not p is None) and (p.is_alive()):
                logger.info(f"Terminating process {p.pid}")
                p.kill()
                p.join()
        self.processes = []
        self.db_session.close()
        return

    # def run(self):
    #     """Start tailing in a background thread and block until stopped."""
    #     logger.info(f"[LogMonitor] Starting—tailing {self.logfile_path}")
    #     t = threading.Thread(target=self._tail_loop, daemon=True)
    #     t.start()
    #     try:
    #         while True:
    #             time.sleep(1)
    #     except KeyboardInterrupt:
    #         print("[LogMonitor] Stopping...")
    #         self._stop_event.set()
    #         t.join()
    #         print("[LogMonitor] Stopped")
