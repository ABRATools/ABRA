## Create Local Registry
```bash
mkdir -p /tmp/regitsry
podman run --privileged -d --name registry -p 5000:5000 -v /tmp/registry:/tmp/registry --restart=always registry:2
nano /etc/containers/registries.conf #add 'localhost:5000'
systemctl restart podman
```

git clone https
podman build -t alma-xfce-vnc -f Containerfile.vnc_xfce_firefox
podman tag localhost/alma-xfce-vnc:latest localhost:5000/alma-dev
podman run -it -p 5901:5901 -p 6901:6901 localhost:5000/alma-dev:latest bash
