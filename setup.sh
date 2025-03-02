#!/bin/bash
set -x
if [ -z $1 ]; then
echo "Node Type Required" && exit 1;
fi
node_type="${1}"

#install podman
cd /srv/
dnf -y install podman git nfs-utils

#clone repo
git clone https://github.com/ABRATools/ABRA.git

#load container images
mkdir -p /etc/abra/images
if [ -z $2 ]; then
  echo "Container Images NFS Server Not Supplied";
else
  nfs_connection="${2}"
  #like 10.0.0.1:/exports/images
  mount -t nfs ${2} /etc/abra/images
fi


#load ebpf files -^ moved to image folder

#if [ -z $3 ]; then
#  echo "EBPF NFS Server Not Supplied"
#else
#  mkdir -p /nfs/ebpf
#  epbf="${3}"
#  #like 10.0.0.1:/exports/ebpf
#  mount -t nfs ${3} /nfs/ebpf
#fi



#section installer
#for control node only

#create and run everything under abra user
if [ node_type == "controller" ]; then
  cd /srv/ABRA/
  python3 -m pip install --yes venv
  python3 -m venv venv
  source ./venv/bin/activate
  #installing python dependancies
  python3 -m pip install -r backend/requirements.txt --yes
  deactivate
  dnf -y install nodejs npm git
  cd /srv/ABRA/frontend/
  npm i typescript vite
  npm install
  npm run build

  subnet="10.0.1.0"
  mask="24"

  ssh-keygen -t ed25519 -f /root/.ssh/api -N ''
  sed -i "s/root@$(hostname)/api/" api.pub
  cp /root/.ssh/api/api.pub /etc/abra/images

  mkdir /run/abra
  #mkdir -p /etc/abra/images
  touch /etc/abra/active_jobs

  mkdir /var/log/abra

  echo "\n/etc/abra/images     ${subnet}/{mask}(ro,async,no_root_squash,crossmnt,no_subtree_check)\n" >> /etc/exports
  echo "\n/var/log/abra     ${subnet}/{mask}(ro,async,no_root_squash,crossmnt,no_subtree_check)\n" >> /etc/exports

  exportfs -a
  systemctl enable nfs-server
  systemctl start nfs-server


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
  ExecStart=/srv/ABRA-Tools/backend/venv/bin/python /srv/ABRA-Tools/backend2/dev.py
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

fi

if [ node_type == "compute" ]; then
  controller="10.0.1.1"

  dnf install -y podman,oci-seccomp-bpf-hook
  systemctl start podman.service
  #podman run --annotation io.containers.trace-syscall=of:/tmp/ls.json almalinux:latest ls / >/dev/null
  #podman run --security-opt seccomp=/tmp/ls.json almalinux:latest ls / >/dev/null

  mkdir /var/log/abra
  mount -t nfs ${controller}:/abra /var/log/abra
  mkdir -p /etc/abra/images
  mount -t nfs ${controller}:/images /etc/abra/images

  echo /etc/abra/images/api.pub>/root/.ssh/authorized_keys
fi
