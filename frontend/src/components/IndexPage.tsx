import Navbar from './Navbar';
import PageLayout from './PageLayout';
import { useAuthenticateUser } from "../hooks/useAuthenticateUser";

export default function IndexPage() {
    useAuthenticateUser();

    return (
        <div>
            <Navbar />
            <PageLayout>
                <h1 className="text-2xl font-semibold">Index Page</h1>
            </PageLayout>
        </div>
    );
}
