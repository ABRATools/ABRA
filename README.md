# ABRA-Tools

## Head Node Build
```curl -o- https://raw.githubusercontent.com/aparkerson/ABRA-Tools/refs/heads/main/setup.sh | bash -s -- controller```

## Compute Node Build
```curl -o- https://raw.githubusercontent.com/aparkerson/ABRA-Tools/refs/heads/main/setup.sh | bash -s -- compute```

## Frontend / Log Aggregator

### Frontend: React w/ TS built with Vite

How to build:

1. Clone repository
2. ```cd frontend/```
3. ```npm i```
4. ```npm run build```

### Backend / Log Aggregator: FastAPI

How to build:

1. ```cd backend/```
2. ```python3 -m venv venv```
3. ```. venv/bin/activate```
4. ```pip install -r requirements.txt```
5. ```python3 main.py```

## systemd-nspawn Scripts

Creating an Ubuntu container:

1. ```sudo dnf install systemd-container curl```
2. ```chmod +x create_ubuntu_container.sh```
3. ```sudo ./create_ubuntu_container.sh```

## eBPF Scripts

## ABRA Daemon

## General Information

### Default Login Credentials

1. admin

    ```text
    username: admin
    password abra
    ```

2. sysadmin1

    ```text
    username: sysadmin1
    password sysadmin1
    ```
