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

#### LDAP Users

1. abra-sysadmin-1

    ```text
    username: abra-sysadmin-1
    password: helloworld29
    membership: abra_ldap_admins, abra_ldap_sysadmins
    ```

2. abra-sysadmin-2

    ```text
    username: abra-sysadmin-2
    password: whatthe29
    membership: abra_ldap_sysadmins
    ```

3. abra-guest-1

    ```text
    username: abra-guest-1
    password: bunnyrabbit29
    membership: abra_ldap_guests
    ```

4. bind_user

    ```text
    username: bind_user
    password: graphicalacceleration29
    ```

ABRA maps those in the ```abra_ldap_admins```, ```abra_ldap_sysadmins```, and ```abra_ldap_guests``` automatically.
