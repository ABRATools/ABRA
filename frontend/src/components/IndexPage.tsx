import Navbar from './Navbar';
import PageLayout from './PageLayout';
import useAuth from "../hooks/useAuth";
import { Link } from 'react-router-dom';

// redirect to dashboard if user is authenticated

export default function IndexPage() {
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
        <div>
            <Navbar />
            <PageLayout>
                <h1 className="text-3xl font-semibold align-middle">Welcome to.....</h1>
                <div className='flex flex-col items-center'>
                    <pre className='block whitespace-pre-wrap min-h-192 w-[700px]'>
 ▄▄▄      ▄▄▄▄   ██▀███  ▄▄▄         ▄▄▄█████▓▒█████  ▒█████  ██▓     ██████
▒████▄   ▓█████▄▓██ ▒ ██▒████▄       ▓  ██▒ ▓▒██▒  ██▒██▒  ██▓██▒   ▒██    ▒
▒██  ▀█▄ ▒██▒ ▄█▓██ ░▄█ ▒██  ▀█▄     ▒ ▓██░ ▒▒██░  ██▒██░  ██▒██░   ░ ▓██▄   
░██▄▄▄▄██▒██░█▀ ▒██▀▀█▄ ░██▄▄▄▄██    ░ ▓██▓ ░▒██   ██▒██   ██▒██░     ▒   ██▒
 ▓█   ▓██░▓█  ▀█░██▓ ▒██▒▓█   ▓██▒     ▒██▒ ░░ ████▓▒░ ████▓▒░██████▒██████▒▒
 ▒▒   ▓▒█░▒▓███▀░ ▒▓ ░▒▓░▒▒   ▓▒█░     ▒ ░░  ░ ▒░▒░▒░░ ▒░▒░▒░░ ▒░▓  ▒ ▒▓▒ ▒ ░
  ▒   ▒▒ ▒░▒   ░  ░▒ ░ ▒░ ▒   ▒▒ ░       ░     ░ ▒ ▒░  ░ ▒ ▒░░ ░ ▒  ░ ░▒  ░ ░
  ░   ▒   ░    ░  ░░   ░  ░   ▒        ░     ░ ░ ░ ▒ ░ ░ ░ ▒   ░ ░  ░  ░  ░
      ░  ░░        ░          ░  ░               ░ ░     ░ ░     ░  ░     ░
            ░</pre>
                    <h2 className="text-2xl font-semibold align-middle pt-[40px]">the ultimate  tools explicity designed for cis admins..............</h2>

                    <h4 className="text-lg rounded border-4 bg-black max-w-min border-[#123123] pt-[20px] p-2">
                        <Link to="/dashboard" className="text-blue-500 max-w-max">
                            Enter the experiecnee...................
                        </Link>
                    </h4>
                </div>
            </PageLayout>
        </div>
    );
}