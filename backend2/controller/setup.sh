python3 -m pip install -r requirements.txt

subnet="10.0.1.0"
mask="24"

mkdir /run/abr
mkdir -p /etc/abra/images
touch /etc/abra/active_jobs

mkdir /var/log/abra

echo "\n/etc/abra/images     ${subnet}/{mask}(ro,async,no_root_squash,crossmnt,no_subtree_check)\n" >> /etc/exports
echo "\n/var/log/abra     ${subnet}/{mask}(ro,async,no_root_squash,crossmnt,no_subtree_check)\n" >> /etc/exports
