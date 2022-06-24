import { lazy } from 'react';

// project imports
import MainLayout from 'layout/MainLayout';
import Loadable from 'ui-component/Loadable';

// sample page routing
const Home = Loadable(lazy(() => import('views/home/Home')));
const SamplePage = Loadable(lazy(() => import('views/sample-page')));

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
    path: '/',
    element: <MainLayout />,
    children: [
        {
            path: '/',

            element: <Home />
        },
        {
            path: '/sample-page',

            element: <SamplePage />
        },
    ]
};

export default MainRoutes;
