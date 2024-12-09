import os
import shutil
import time
import logging
import configparser
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta

# setup configurable retention period & archive dir
# config = configparser.ConfigParser()
# config.read("log_rotator_config.ini")
# RETENTION_TIME = int(config.get("settings", "retention_days", fallback=30))   # 30 day retention
# DEBUG = config.getboolean("settings", "debug", fallback=False)

# logging.basicConfig(level=logging.DEBUG if DEBUG else logging.INFO, 
#                       format='%(asctime)s | %(levelname)s | %(message)s')
# logger = logging.getLogger(__name__)

BACKEND = "./backend"
ARCHIVE_DIR = os.path.join(BACKEND, "archived_logs")
LIFETIME = 30   # retain logs for 30 days

os.makedirs(ARCHIVE_DIR, exist_ok=True)


# send notification of critical errors
def send_error_notification(message):
    # update to send external notification
    print(message)


# archive file
def archive_log(fpath):
    try:
        if not os.path.exists(fpath):
            raise FileNotFoundError(f"Log file {fpath} not found.")
        
        timestamp = time.strftime("%Y%m%d-%H%M%S")
        archive_path = os.path.join(ARCHIVE_DIR, f"{os.path.basename(fpath)}.{timestamp}.gz")

        # compress log file, move to archive
        shutil.move(fpath, f"{fpath}.tmp")
        with open(f"{fpath}.tmp", "rb") as source:
            with open(archive_path, "wb") as destination:
                shutil.copyfileobj(source, destination)
        os.remove(f"{fpath}.tmp")

        # logger.info(f"Log file archived to {archive_path}")
        return archive_path
    
    except Exception as e:
        # logger.error(f"Error deleting file {fpath}: {e}")
        send_error_notification(f"Error deleting file {fpath}: {e}")
        return None
    

# check for need to archive based on defined lifetime
def should_archive(fpath):
    try:
        file_age = time.time() - os.path.getmtime(fpath)
        if file_age > LIFETIME * 24 * 60 * 60:
            return True
    
    except Exception as e:
        # logger.error(f"Error checking file age for {fpath}: {e}")
        send_error_notification(f"Error checking file age for {fpath}: {e}")
        return False
    
    return False

# maintains timely logs using defined active log lifetime
def rotate_logs():
    archived = []
    deleted = []
    skipped = []

    for file in os.listdir(BACKEND):
        fpath = os.path.join(BACKEND, file)

        if not file.endswith(".log"):
            if not file.endswith(".log.gz"):
                skipped.append(file)
                continue

        if os.path.islink(fpath):
            # logger.info(f"Skipped symbolic link: {fpath})
            skipped.append(file)
            continue

        if should_archive(fpath):
            archived_path = archive_log(fpath)
            
            if archived_path:
                archived.append(file)
            
            else:
                deleted.append(file)
                try:
                    os.remove(fpath)

                except Exception as e:
                    # logger.error(f"Error deleting file {fpath}: {e}")
                    # send_error_notification(f"Error deleting file {fpath}: {e}")
                    skipped.append(file)

        else:
            skipped.append(file)
    
    generate_report(archived, deleted, skipped)


# generate summary report of log rotation data
def generate_report(archived, deleted, skipped):
    report_path = os.path.join(BACKEND, "log_rotation_summary.txt")
    try:
        with open(report_path, "w") as report:
            report.write(f"Log Rotation Summary Report - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            report.write(f"Log Backend: {BACKEND}\n")
            report.write(f"Retention Period: {LIFETIME} days\n")
            report.write("\n")

            report.write(f"Archived files: {len(archived)}\n")
            report.write(f"Deleted files: {len(deleted)}\n")
            report.write(f"Skipped files: {len(skipped)}\n")

        # logger.info(f"Summary report generated: {report_path})

    except Exception as e:
        # logger.error(f"Error generating summary report: {e}")
        send_error_notification(f"Error generating summary report: {e}")


# driver logic
def start_log_rotate():
    try:
        # logger.info("Starting log rotation.")
        if rotate_logs():
            # logger.info("Completed log rotation.")
            None

    except Exception as e:
        # logger.error(f"Error occured during log rotation: {e}")
        send_error_notification(f"Error during log rotation: {e}")