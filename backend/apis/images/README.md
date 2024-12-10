podman build -t alma-vnc-xfce https://github.com/aparkerson/ABRA-Tools/backend/apis/images/Containerfile.vnc_xfce_firefox.git

podman run -dit -p 5901:5901 -p 6901:6901 alma-vnc-xfce
