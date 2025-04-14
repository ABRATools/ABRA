#install podman
#install python dependencies
#install systemctl service
#start podman systemctl service


#define config file
echo "network interface = $(ip a | grep "state UP"|awk -F': ' '{print $2}'|head -n 1) "> /etc/default/abra
echo bridge name 

#setup container network



#setup statistic endpoint



#section installer into head, node, and container
