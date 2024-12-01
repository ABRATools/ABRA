import Navbar from './Navbar';
import NodeSelect from './Dashboarding/NodeSelect';
import useAuth from '../hooks/useAuth';
import { ThemeProvider } from './Theming/ThemeProvider';

export default function Dashboard() {
    const { isAuthorized, loading } = useAuth(() => {
		window.location.href = '/login';
		// console.log('Unauthorized');
	});

	if (isAuthorized) {
		// window.location.href = '/dashboard';
		console.log('Authorized');
	}

	if (loading) {
		return <div>Loading...</div>;
	}
    return (
        <ThemeProvider defaultTheme='light' storageKey='vite-ui-theme'>
            <Navbar />
            <NodeSelect />
        </ThemeProvider>
    );
}

// export default function Dashboard() {
//     const example_cpu_data = [
//         {date: '2021-10-01', cpu_percent: 5},
//         {date: '2021-10-02', cpu_percent: 5},
//         {date: '2021-10-03', cpu_percent: 35},
//         {date: '2021-10-04', cpu_percent: 65},
//         {date: '2021-10-05', cpu_percent: 95},
//         {date: '2021-10-06', cpu_percent: 10},
//         {date: '2021-10-07', cpu_percent: 10},
//         {date: '2021-10-08', cpu_percent: 15},
//         {date: '2021-10-09', cpu_percent: 20},
//         {date: '2021-10-10', cpu_percent: 10},
//     ];
//     const example_ram_data = [
//         {date: '2021-10-01', ram_percent: 10},
//         {date: '2021-10-02', ram_percent: 20},
//         {date: '2021-10-03', ram_percent: 30},
//         {date: '2021-10-04', ram_percent: 20},
//         {date: '2021-10-05', ram_percent: 5},
//         {date: '2021-10-06', ram_percent: 5},
//         {date: '2021-10-07', ram_percent: 5},
//         {date: '2021-10-08', ram_percent: 5},
//         {date: '2021-10-09', ram_percent: 8},
//         {date: '2021-10-10', ram_percent: 8},
//     ];
//     const example_net_data = [
//         {date: '2021-10-01', net_percent: 5},
//         {date: '2021-10-02', net_percent: 5},
//         {date: '2021-10-03', net_percent: 30},
//         {date: '2021-10-04', net_percent: 5},
//         {date: '2021-10-05', net_percent: 2},
//         {date: '2021-10-06', net_percent: 2},
//         {date: '2021-10-07', net_percent: 70},
//         {date: '2021-10-08', net_percent: 4},
//         {date: '2021-10-09', net_percent: 4},
//         {date: '2021-10-10', net_percent: 4},
//     ];
//     const example_disk_data = [
//         {date: '2021-10-01', disk_percent: 2},
//         {date: '2021-10-02', disk_percent: 2},
//         {date: '2021-10-03', disk_percent: 3},
//         {date: '2021-10-04', disk_percent: 50},
//         {date: '2021-10-05', disk_percent: 2},
//         {date: '2021-10-06', disk_percent: 2},
//         {date: '2021-10-07', disk_percent: 2},
//         {date: '2021-10-08', disk_percent: 2},
//         {date: '2021-10-09', disk_percent: 2},
//         {date: '2021-10-10', disk_percent: 2},
//     ];

//     return (
//         <>
        
//         </>
//     )

//     // return (
//     //     <>
//     //     <Navbar />
//     //     {/* test sample for pa2 lol */}
//     //         {/* <div className='w-full py-[2rem] flex flex-row align-center border-abra-secondary'>
//     //             <div className='flex-1 flex flex-col px-[20px] max-w-[350px] gap-[20px] h-almost-full'>
//     //                 <h2 className='text-3xl border-abra-primary border-b-2 max-w-[250px] text-center'>Nodes</h2>
//     //                 <div className='border-abra-secondary border-2 ml-[10px] p-[10px] w-max'>
//     //                     <h3 className='text-2xl'>Node 1</h3>
//     //                 </div>
//     //                 <div className='border-abra-secondary border-2 ml-[10px] p-[10px] w-max'>
//     //                     <h3 className='text-2xl'>Node 2</h3>
//     //                 </div>
//     //                 <div className='border-abra-secondary border-2 ml-[10px] p-[10px] w-max'>
//     //                     <h3 className='text-2xl'>Node 3</h3>
//     //                 </div>
//     //             </div>
//     //             <div className='flex flex-col items-center w-full'>
//     //                 <h2 className='text-3xl mb-[20px]'>Select a node to view environments</h2>
//     //                 <button className='btn btn-primary w-[150px] bg-white'>Add Node</button>
//     //             </div>
//     //         </div> */}
//     //         <div className='w-full flex flex-row align-center border-abra-secondary'>

//     //             <div className='flex-1 py-[2rem] flex flex-col px-[20px] max-w-[350px] gap-[20px] h-almost-full'>
//     //                 <h2 className='text-3xl border-abra-primary border-b-2 max-w-[250px] text-center'>Nodes</h2>
//     //                 <div className='border-abra-secondary border-2 ml-[10px] p-[10px] w-max'>
//     //                     <h3 className='text-2xl'>Node 1</h3>
//     //                 </div>
//     //                 <div className='border-abra-secondary border-2 ml-[10px] p-[10px] w-max bg-[#757575]'>
//     //                     <h3 className='text-2xl font-bold'>Node 2</h3>
//     //                 </div>
//     //                 <div className='border-abra-secondary border-2 ml-[10px] p-[10px] w-max'>
//     //                     <h3 className='text-2xl'>Node 3</h3>
//     //                 </div>
//     //             </div>
//     //             <div className='w-full'>
//     //                 <div className='flex flex-row justify-between py-[20px] mb-[10px] border-2 border-b-black px-[10px]'>
//     //                     <h2 className='text-3xl text-abra-primary self-end font-bold'>Node 2</h2>
//     //                     <div>
//     //                         <button className='btn btn-primary border-0 mx-[2px] rounded-none bg-[#757575]'>Add Environment</button>
//     //                         <button className='btn btn-primary border-0 mx-[2px] rounded-none bg-[#757575]'>Shutdown</button>
//     //                         <button className='btn btn-primary border-0 mx-[2px] rounded-none bg-[#757575]'>Reboot</button>
//     //                     </div>
//     //                 </div>
//     //                 <div className='flex flex-row h-full'>
//     //                     <div className='flex flex-col max-w-[350px]'>
//     //                         <div className='w-full p-[20px] border-2 border-black'>
//     //                             <h2>Summary: </h2>
//     //                         </div>
//     //                         <div className='w-full p-[20px] border-2 border-black'>
//     //                             <h2>Environments: </h2>
//     //                         </div>
//     //                         <div className='w-full p-[20px] border-2 border-black bg-[#757575]'>
//     //                             <h2 className='font-bold'>Total Logs: </h2>
//     //                         </div>
//     //                     </div>
//     //                     <div className='flex flex-col w-full px-[5px]'>
//     //                         {/* sample summary for pa2 */}
//     //                         {/* <h2 className='text-xl'>Environments:</h2>
//     //                         <table className='w-full border-collapse border-2 border-black bg-[#757575]'>
//     //                             <thead className='border-2 border-black text-left'>
//     //                                 <tr className='py-[10px]'>
//     //                                     <th>Machine Name</th>
//     //                                     <th>IP</th>
//     //                                     <th>OS</th>
//     //                                     <th>Status</th>
//     //                                     <th>Total CPU</th>
//     //                                     <th>Total Memory</th>
//     //                                     <th>Total Disk</th>
//     //                                 </tr>
//     //                             </thead>
//     //                             <tbody>
//     //                                 <tr className="even:bg-gray-50 odd:bg-white">
//     //                                     <td>Machine 1</td>
//     //                                     <td>10.0.0.10</td>
//     //                                     <td>Fedora</td>
//     //                                     <td>Running</td>
//     //                                     <td>4</td>
//     //                                     <td>8GB</td>
//     //                                     <td>256GB</td>
//     //                                 </tr>
//     //                                 <tr className='even:bg-gray-50 odd:bg-white'>
//     //                                     <td>Machine 2</td>
//     //                                     <td>10.0.0.11</td>
//     //                                     <td>Fedora</td>
//     //                                     <td>Running</td>
//     //                                     <td>4</td>
//     //                                     <td>4GB</td>
//     //                                     <td>50GB</td>
//     //                                 </tr>
//     //                                 <tr className='even:bg-gray-50 odd:bg-white'>
//     //                                     <td>Machine 3</td>
//     //                                     <td>10.0.0.12</td>
//     //                                     <td>Ubuntu</td>
//     //                                     <td>Running</td>
//     //                                     <td>2</td>
//     //                                     <td>4GB</td>
//     //                                     <td>30GB</td>
//     //                                 </tr>
//     //                             </tbody>
//     //                         </table>
//     //                         <h2 className='text-xl'>Node CPU Usage:</h2>
//     //                         <ResponsiveContainer width="100%" height={250}>
//     //                             <LineChart data={example_cpu_data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
//     //                                 <CartesianGrid strokeDasharray="3 3" />
//     //                                 <XAxis dataKey="date" />
//     //                                 <YAxis />
//     //                                 <Tooltip />
//     //                                 <Legend />
//     //                                 <Line type="monotone" dataKey="cpu_percent" stroke="#8884d8" activeDot={{ r: 8 }} isAnimationActive={false} strokeWidth={3}/>
//     //                             </LineChart>
//     //                         </ResponsiveContainer>
//     //                         <h2 className='text-xl'>Node Memory Usage:</h2>
//     //                         <ResponsiveContainer width="100%" height={250}>
//     //                             <LineChart data={example_ram_data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
//     //                                 <CartesianGrid strokeDasharray="3 3" />
//     //                                 <XAxis dataKey="date" />
//     //                                 <YAxis />
//     //                                 <Tooltip />
//     //                                 <Legend />                        
//     //                                 <Line type="monotone" dataKey="ram_percent" stroke="#8884d8" activeDot={{ r: 8 }} isAnimationActive={false} strokeWidth={3}/>
//     //                             </LineChart>
//     //                         </ResponsiveContainer>
//     //                         <h2 className='text-xl'>Node Network Usage:</h2>
//     //                         <ResponsiveContainer width="100%" height={250}>
//     //                             <LineChart data={example_net_data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
//     //                                 <CartesianGrid strokeDasharray="3 3" />
//     //                                 <XAxis dataKey="date" />
//     //                                 <YAxis />
//     //                                 <Tooltip />
//     //                                 <Legend />
//     //                                 <Line type="monotone" dataKey="net_percent" stroke="#8884d8" activeDot={{ r: 8 }} isAnimationActive={false} strokeWidth={3}/>
//     //                             </LineChart>
//     //                         </ResponsiveContainer> */}
//     //                         {/* example environments for pa2 */}
//     //                         {/* <h2 className='text-xl font-bold'>Environment 1</h2>
//     //                         <div className='flex flex-col'>
//     //                             <div className='flex flex-row gap-[10px]'>
//     //                                 <li>CPU:</li>
//     //                                 <p>32% of 8 CPUs</p>
//     //                             </div>
//     //                             <div className='flex flex-row gap-[10px]'>
//     //                                 <li>Memory:</li>
//     //                                 <p>32% of 32GB</p>
//     //                             </div>
//     //                             <div className='flex flex-row gap-[10px]'>
//     //                                 <li>Disk:</li>
//     //                                 <p>32% of 256GB</p>
//     //                             </div>
//     //                             <div className='flex flex-row gap-[10px]'>
//     //                                 <li>Logs:</li>
//     //                                 <p>32</p>
//     //                             </div>
//     //                         </div>
//     //                         <div className='flex flex-row justify-between'>
//     //                             <div className='w-[50%]'>
//     //                                 <h2 className='text-xl'>CPU Usage:</h2>
//     //                                 <ResponsiveContainer width="100%" height={250}>
//     //                                     <LineChart data={example_cpu_data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
//     //                                         <CartesianGrid strokeDasharray="3 3" />
//     //                                         <XAxis dataKey="date" />
//     //                                         <YAxis />
//     //                                         <Tooltip />
//     //                                         <Legend />
//     //                                         <Line type="monotone" dataKey="cpu_percent" stroke="#8884d8" activeDot={{ r: 8 }} isAnimationActive={false} strokeWidth={3}/>
//     //                                     </LineChart>
//     //                                 </ResponsiveContainer>
//     //                             </div>
//     //                             <div className='w-[50%]'>
//     //                                 <h2 className='text-xl'>Memory Usage:</h2>
//     //                                 <ResponsiveContainer width="100%" height={250}>
//     //                                     <LineChart data={example_ram_data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
//     //                                         <CartesianGrid strokeDasharray="3 3" />
//     //                                         <XAxis dataKey="date" />
//     //                                         <YAxis />
//     //                                         <Tooltip />
//     //                                         <Legend />                        
//     //                                         <Line type="monotone" dataKey="ram_percent" stroke="#8884d8" activeDot={{ r: 8 }} isAnimationActive={false} strokeWidth={3}/>
//     //                                     </LineChart>
//     //                                 </ResponsiveContainer>
//     //                             </div>
//     //                         </div>
//     //                         <div className='flex flex-row justify-between'>
//     //                             <div className='w-[50%]'>
//     //                                 <h2 className='text-xl'>Network Usage:</h2>
//     //                                 <ResponsiveContainer width="100%" height={250}>
//     //                                     <LineChart data={example_net_data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
//     //                                         <CartesianGrid strokeDasharray="3 3" />
//     //                                         <XAxis dataKey="date" />
//     //                                         <YAxis />
//     //                                         <Tooltip />
//     //                                         <Legend />
//     //                                         <Line type="monotone" dataKey="net_percent" stroke="#8884d8" activeDot={{ r: 8 }} isAnimationActive={false} strokeWidth={3}/>
//     //                                     </LineChart>
//     //                                 </ResponsiveContainer>
//     //                             </div>
//     //                             <div className='w-[50%]'>
//     //                                 <h2 className='text-xl'>Disk Usage:</h2>
//     //                                 <ResponsiveContainer width="100%" height={250}>
//     //                                     <LineChart data={example_disk_data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
//     //                                         <CartesianGrid strokeDasharray="3 3" />
//     //                                         <XAxis dataKey="date" />
//     //                                         <YAxis />
//     //                                         <Tooltip />
//     //                                         <Legend />                        
//     //                                         <Line type="monotone" dataKey="disk_percent" stroke="#8884d8" activeDot={{ r: 8 }} isAnimationActive={false} strokeWidth={3}/>
//     //                                     </LineChart>
//     //                                 </ResponsiveContainer>
//     //                             </div>
//     //                         </div>
//     //                         <h2 className='text-xl'>Environment 2</h2>
//     //                         <h2 className='text-xl'>Environment 3</h2> */}
//     //                         <h2 className='text-xl font-bold'>Environment 1</h2>
//     //                         <div className='flex flex-col bg-black h-[400px] w-full overflow-scroll	'>
//     //                             <code className='text-white'>I0223 20:04:25.084507       1 loader.go:379] Config loaded from file:  /etc/kubernetes/static-pod-resources/configmaps/kube-apiserver-cert-syncer-kubeconfig/kubeconfig</code>
//     //                             <code className='text-white'>Copying termination logs to "/var/log/kube-apiserver/termination.log"</code>
//     //                             <code className='text-white'>I0223 20:04:25.087543       1 main.go:124] Touching termination lock file "/var/log/kube-apiserver/.terminating"</code>
//     //                             <code className='text-white'>I0223 20:04:25.088797       1 main.go:182] Launching sub-process "/usr/bin/hyperkube kube-apiserver --openshift-config=/etc/kubernetes/static-pod-resources/configmaps/config/config.yaml --advertise-address=10.0.171.12 -v=2 --permit-address-sharing"</code>
//     //                             <code className='text-white'>Flag --openshift-config has been deprecated, to be removed</code>
//     //                             <code className='text-white'>I0223 20:04:25.238681      17 plugins.go:84] Registered admission plugin "authorization.openshift.io/RestrictSubjectBindings"</code>
//     //                             <code className='text-white'>I0223 20:04:25.238763      17 plugins.go:84] Registered admission plugin "image.openshift.io/ImagePolicy"</code>
//     //                             <code className='text-white'>I0223 20:04:25.238775      17 plugins.go:84] Registered admission plugin "route.openshift.io/IngressAdmission"</code>
//     //                             <code className='text-white'>I0223 20:04:25.238783      17 plugins.go:84] Registered admission plugin "scheduling.openshift.io/OriginPodNodeEnvironment"</code>
//     //                             <code className='text-white'>I0223 20:04:25.238792      17 plugins.go:84] Registered admission plugin "autoscaling.openshift.io/ClusterResourceOverride"</code>
//     //                             <code className='text-white'>I0223 20:04:25.238801      17 plugins.go:84] Registered admission plugin "quota.openshift.io/ClusterResourceQuota"</code>
//     //                             <code className='text-white'>I0223 20:04:25.238810      17 plugins.go:84] Registered admission plugin "autoscaling.openshift.io/RunOnceDuration"</code>
//     //                             <code className='text-white'>I0223 20:04:25.238819      17 plugins.go:84] Registered admission plugin "scheduling.openshift.io/PodNodeConstraints"</code>
//     //                             <code className='text-white'>I0223 20:04:25.238829      17 plugins.go:84] Registered admission plugin "security.openshift.io/SecurityContextConstraint"</code>
//     //                             <code className='text-white'>I0223 20:04:25.238838      17 plugins.go:84] Registered admission plugin "security.openshift.io/SCCExecRestrictions"</code>
//     //                             <code className='text-white'>I0223 20:04:25.238846      17 plugins.go:84] Registered admission plugin "network.openshift.io/ExternalIPRanger"</code>
//     //                             <code className='text-white'>I0223 20:04:25.238856      17 plugins.go:84] Registered admission plugin "network.openshift.io/RestrictedEndpointsAdmission"</code>
//     //                         </div>
//     //                         <h2 className='text-xl font-bold'>Environment 2</h2>
//     //                         <div className='flex flex-col bg-black h-[400px] w-full overflow-scroll	'>
//     //                             <code className='text-white'>I0223 20:04:25.084507       1 loader.go:379] Config loaded from file:  /etc/kubernetes/static-pod-resources/configmaps/kube-apiserver-cert-syncer-kubeconfig/kubeconfig</code>
//     //                             <code className='text-white'>Copying termination logs to "/var/log/kube-apiserver/termination.log"</code>
//     //                             <code className='text-white'>I0223 20:04:25.087543       1 main.go:124] Touching termination lock file "/var/log/kube-apiserver/.terminating"</code>
//     //                             <code className='text-white'>I0223 20:04:25.088797       1 main.go:182] Launching sub-process "/usr/bin/hyperkube kube-apiserver --openshift-config=/etc/kubernetes/static-pod-resources/configmaps/config/config.yaml --advertise-address=10.0.171.12 -v=2 --permit-address-sharing"</code>
//     //                             <code className='text-white'>Flag --openshift-config has been deprecated, to be removed</code>
//     //                             <code className='text-white'>I0223 20:04:25.238681      17 plugins.go:84] Registered admission plugin "authorization.openshift.io/RestrictSubjectBindings"</code>
//     //                             <code className='text-white'>I0223 20:04:25.238763      17 plugins.go:84] Registered admission plugin "image.openshift.io/ImagePolicy"</code>
//     //                             <code className='text-white'>I0223 20:04:25.238775      17 plugins.go:84] Registered admission plugin "route.openshift.io/IngressAdmission"</code>
//     //                             <code className='text-white'>I0223 20:04:25.238783      17 plugins.go:84] Registered admission plugin "scheduling.openshift.io/OriginPodNodeEnvironment"</code>
//     //                             <code className='text-white'>I0223 20:04:25.238792      17 plugins.go:84] Registered admission plugin "autoscaling.openshift.io/ClusterResourceOverride"</code>
//     //                             <code className='text-white'>I0223 20:04:25.238801      17 plugins.go:84] Registered admission plugin "quota.openshift.io/ClusterResourceQuota"</code>
//     //                             <code className='text-white'>I0223 20:04:25.238810      17 plugins.go:84] Registered admission plugin "autoscaling.openshift.io/RunOnceDuration"</code>
//     //                             <code className='text-white'>I0223 20:04:25.238819      17 plugins.go:84] Registered admission plugin "scheduling.openshift.io/PodNodeConstraints"</code>
//     //                             <code className='text-white'>I0223 20:04:25.238829      17 plugins.go:84] Registered admission plugin "security.openshift.io/SecurityContextConstraint"</code>
//     //                             <code className='text-white'>I0223 20:04:25.238838      17 plugins.go:84] Registered admission plugin "security.openshift.io/SCCExecRestrictions"</code>
//     //                             <code className='text-white'>I0223 20:04:25.238846      17 plugins.go:84] Registered admission plugin "network.openshift.io/ExternalIPRanger"</code>
//     //                             <code className='text-white'>I0223 20:04:25.238856      17 plugins.go:84] Registered admission plugin "network.openshift.io/RestrictedEndpointsAdmission"</code>
//     //                         </div>
//     //                         <h2 className='text-xl font-bold'>Environment 3</h2>
//     //                         <div className='flex flex-col bg-black h-[400px] w-full overflow-scroll	'>
//     //                             <code className='text-white'>I0223 20:04:25.084507       1 loader.go:379] Config loaded from file:  /etc/kubernetes/static-pod-resources/configmaps/kube-apiserver-cert-syncer-kubeconfig/kubeconfig</code>
//     //                             <code className='text-white'>Copying termination logs to "/var/log/kube-apiserver/termination.log"</code>
//     //                             <code className='text-white'>I0223 20:04:25.087543       1 main.go:124] Touching termination lock file "/var/log/kube-apiserver/.terminating"</code>
//     //                             <code className='text-white'>I0223 20:04:25.088797       1 main.go:182] Launching sub-process "/usr/bin/hyperkube kube-apiserver --openshift-config=/etc/kubernetes/static-pod-resources/configmaps/config/config.yaml --advertise-address=10.0.171.12 -v=2 --permit-address-sharing"</code>
//     //                             <code className='text-white'>Flag --openshift-config has been deprecated, to be removed</code>
//     //                             <code className='text-white'>I0223 20:04:25.238681      17 plugins.go:84] Registered admission plugin "authorization.openshift.io/RestrictSubjectBindings"</code>
//     //                             <code className='text-white'>I0223 20:04:25.238763      17 plugins.go:84] Registered admission plugin "image.openshift.io/ImagePolicy"</code>
//     //                             <code className='text-white'>I0223 20:04:25.238775      17 plugins.go:84] Registered admission plugin "route.openshift.io/IngressAdmission"</code>
//     //                             <code className='text-white'>I0223 20:04:25.238783      17 plugins.go:84] Registered admission plugin "scheduling.openshift.io/OriginPodNodeEnvironment"</code>
//     //                             <code className='text-white'>I0223 20:04:25.238792      17 plugins.go:84] Registered admission plugin "autoscaling.openshift.io/ClusterResourceOverride"</code>
//     //                             <code className='text-white'>I0223 20:04:25.238801      17 plugins.go:84] Registered admission plugin "quota.openshift.io/ClusterResourceQuota"</code>
//     //                             <code className='text-white'>I0223 20:04:25.238810      17 plugins.go:84] Registered admission plugin "autoscaling.openshift.io/RunOnceDuration"</code>
//     //                             <code className='text-white'>I0223 20:04:25.238819      17 plugins.go:84] Registered admission plugin "scheduling.openshift.io/PodNodeConstraints"</code>
//     //                             <code className='text-white'>I0223 20:04:25.238829      17 plugins.go:84] Registered admission plugin "security.openshift.io/SecurityContextConstraint"</code>
//     //                             <code className='text-white'>I0223 20:04:25.238838      17 plugins.go:84] Registered admission plugin "security.openshift.io/SCCExecRestrictions"</code>
//     //                             <code className='text-white'>I0223 20:04:25.238846      17 plugins.go:84] Registered admission plugin "network.openshift.io/ExternalIPRanger"</code>
//     //                             <code className='text-white'>I0223 20:04:25.238856      17 plugins.go:84] Registered admission plugin "network.openshift.io/RestrictedEndpointsAdmission"</code>
//     //                         </div>
//     //                     </div>
//     //                 </div>
//     //             </div>
//     //         </div>
//     //         {/* <>
//     //         <h1 className='text-3xl'>Dashboard</h1>
//     //         {loading && <p>Loading...</p>}
//     //         {error && <p>{error}</p>}
//     //         <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
//     //             {nodes.map((node) => (
//     //                 <div key={node.id} className="p-4 border rounded-md bg-neutral-content shadow-md w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 mx-2 my-2 flex flex-col justify-between">
//     //                     <h2 className="text-lg font-semibold">{node.name}</h2>
//     //                     <div className="flex justify-between mt-2">
//     //                         <p>{node.ip}:{node.port}</p>
//     //                         <p>{node.status}</p>
//     //                     </div>
//     //                     <div className='flex flex-wrap'>
//     //                         {node.environments.map((env) => (
//     //                             <Environment key={env.id} {...env} />
//     //                         ))}
//     //                     </div>
//     //                 </div>
//     //             ))}
//     //         </div>
//     //         </>         */}
//     //     </>
//     // );
// }