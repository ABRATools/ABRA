
import sys, os
sys.path.insert(0, os.path.abspath('..'))

import database as db
import asyncio
import os
import time
import requests
from logger import logger

class LogMonitor:
  def __init__(self, poll_interval: float = 2.5, db_session=None):
    self.poll_interval = poll_interval
    self.db_session = db_session

  def post_notifications(self):
    """
    Create a process (with its own command queue) for each connection string in the database.
    """
    notifiers = db.get_current_notifiers(self.db_session)
    if len(notifiers) == 0:
      return
    unread_notifications = db.get_unread_notifications(self.db_session)
    if len(unread_notifications) == 0:
      return
    for noti in notifiers:
      if noti.webhook_url is None:
        logger.warning(f"[NofificationMonitor] Notifier {noti.webhook_name} has no webhook URL")
        continue
      if noti.enabled:
        for unread in unread_notifications:
          try:
            pass
            embed = self.create_embed(
              title=unread.name,
              description=unread.description,
              severity=unread.severity,
              notification_type=unread.notification_type,
              date_created=unread.date_created
            )
            if embed:
              self._post_embed(embed, webhook_url=noti.webhook_url)
          except Exception as e:
            logger.error(f"[NofificationMonitor] Error creating embed: {e}")
            continue
    for unread in unread_notifications:
      try:
        db.mark_notification_read(self.db_session, unread.id, True)
      except Exception as e:
        logger.error(f"[NofificationMonitor] Error marking notification as read: {e}")
        continue
      
  def create_embed(self, title: str, description: str, severity: str, notification_type: str, date_created: int):
    """
    Create a Discord embed message.
    """
    severity = severity.upper()
    sev_types = ["INFO", "WARNING", "ERROR", "CRITICAL"]
    color = 0x00FF00  # default to green
    if severity not in sev_types:
      logger.error(f"[NofificationMonitor] Invalid severity level: {severity}")
      return None
    if severity == "INFO":
      color = 0x00FF00
    elif severity == "WARNING":
      color = 0xFFA500
    elif severity == "ERROR":
      color = 0xFF0000
    elif severity == "CRITICAL":
      color = 0xFF0000
    embed = {
      "title": title,
      "description": description,
      "color": color,
      "fields": [
          {"name": "Severity", "value": severity, "inline": True},
          {"name": "Type",     "value": notification_type, "inline": True},
          {"name": "Date Created", "value": time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(date_created)), "inline": True},
      ]
    }
    return embed

  def _post_embed(self, embed: dict, webhook_url: str = None):
    payload = {"embeds": [embed]}
    try:
      if webhook_url is None:
        raise ValueError("[NofificationMonitor] No webhook URL provided for notifier")
      resp = requests.post(webhook_url, json=payload, timeout=5)
      resp.raise_for_status()
    except Exception as e:
      logger.error(f"[NofificationMonitor] Failed to send webhook: {e}")

  async def run(self):
    """
    The main async loop that starts the poller processes
    """
    logger.info("[NofificationMonitor] Starting main notification loop")
    try:
      while True:
        self.post_notifications()

        await asyncio.sleep(self.poll_interval)
    except KeyboardInterrupt:
      self.shutdown()
      raise
    except asyncio.CancelledError:
      self.shutdown()
      raise
    except Exception as e:
      logger.error(f"[NofificationMonitor] Exception in main loop: {e}")
      self.shutdown()
      raise
    finally:
      logger.info("[NofificationMonitor] Main loop exited")
      self.shutdown()

  def shutdown(self):
    """
    Terminate all processes and clean up.
    """
    if self.main_task and not self.main_task.done():
      self.main_task.cancel()
      
    self.db_session.close()
    return