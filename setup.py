if [ -z $1 ]; then
echo "Node Type Required" && exit 1;
fi
node_type="${1}"

#install podman
cd /srv/
dnf install podman
git clone https://github.com/aparkerson/ABRA-Tools

#load container images
if [ -z $2 ]; then
  echo "Container Images NFS Server Not Supplied"; 
else
  mkdir -p /nfs/images
  nfs_connection="${2}"
  #like 10.0.0.1:/exports/images
  mount -t nfs ${2} /nfs/images
fi


#load ebpf files
if [ -z $3 ]; then
  echo "EBPF NFS Server Not Supplied"
else
  mkdir -p /nfs/ebpf
  epbf="${3}"
  #like 10.0.0.1:/exports/ebpf
  mount -t nfs ${3} /nfs/ebpf
fi
 
#install backend scripts
cd /srv/ABRA-Tools/backend/
python3 -m pip install venv
python3 -m venv venv
source ./venv/bin/activate
#installing python dependancies
python3 -m pip install -r requirements.txt
deactivate
#python3 main.py //replace with systemctl service

#section installer
#for control node only
if [ node_type == "head" ]
  dnf install nodejs npm git
  cd /srv/ABRA-Tools/frontend/
  npm i typescript vite
  npm install
  npm run build
fi

#install systemctl service
echo > /etc/systemd/system/ABRA-Tools.service << EOL
[Unit]
Description=ABRA-Tools Service
After=network-online.target #more
Wants=network-online.target
Requires=podman.service

[Service]
Type=simple
#EnvironmentFile=
ExecStart=/srv/ABRA-Tools/backend/venv/bin/python /srv/ABRA-Tools/backend/main.py
ExecReload=/bin/kill -HUP $MAINPID
KillMode=process
#Restart=on-failure
#RestartSec=10s

[Install]
WantedBy=multi-user.target
EOL

chmod 664 /etc/systemd/system/ABRA-Tools.service
systemctl daemon-reload
systemctl start ABRA-Tools.service
#start podman systemctl service
#add nfs container image folder (podman pull almalinux:latest)
#create podman user so everything doesnt run as root


#define config file
#echo "network interface = $(ip a | grep "state UP"|awk -F': ' '{print $2}'|head -n 1) "> /etc/default/abra
#echo bridge name 

#setup container network



#setup statistic endpoint
