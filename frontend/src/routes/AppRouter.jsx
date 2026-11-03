import React, { useEffect, useState } from 'react';
import { AppLayout } from '../components/AppLayout.jsx';
import { screens } from '../navigation/screenRoutes.js';
import LoginPage from '../pages/shared/LoginPage.jsx';
import RegisterPage from '../pages/shared/RegisterPage.jsx';
import MyRequestsPage from '../pages/customer/MyRequestsPage.jsx';
import RequestCreatePage from '../pages/customer/RequestCreatePage.jsx';
import RequestDetailPage from '../pages/customer/RequestDetailPage.jsx';
import ProposalReviewPage from '../pages/customer/ProposalReviewPage.jsx';
import RequestTrackingPage from '../pages/customer/RequestTrackingPage.jsx';
import CustomerReviewPage from '../pages/customer/CustomerReviewPage.jsx';
import RequestSearchPage from '../pages/technician/RequestSearchPage.jsx';
import TechnicianRequestDetailPage from '../pages/technician/RequestDetailPage.jsx';
import ProposalCreatePage from '../pages/technician/ProposalCreatePage.jsx';
import MyProposalsPage from '../pages/technician/MyProposalsPage.jsx';
import TechnicianDashboardPage from '../pages/technician/TechnicianDashboardPage.jsx';
import TechnicianReviewPage from '../pages/technician/TechnicianReviewPage.jsx';
import NotificationsPage from '../pages/technician/NotificationsPage.jsx';
import UserManagementPage from '../pages/admin/UserManagementPage.jsx';

const pagesByScreen = {
  '01': LoginPage,
  '02': RegisterPage,
  '03': MyRequestsPage,
  '04': RequestCreatePage,
  '05': RequestDetailPage,
  '06': ProposalReviewPage,
  '07': RequestTrackingPage,
  '08': CustomerReviewPage,
  '09': RequestSearchPage,
  '10': TechnicianRequestDetailPage,
  '11': ProposalCreatePage,
  '12': MyProposalsPage,
  '13': TechnicianDashboardPage,
  '14': TechnicianReviewPage,
  '15': NotificationsPage,
  '16': UserManagementPage,
};

function readScreen() {
  const route = window.location.hash.replace(/^#\/?/, '');
  return screens.find((screen) => screen.path === route || screen.id === route)?.id ?? '01';
}

export function AppRouter() {
  const [screenId, setScreenId] = useState(readScreen);
  useEffect(() => {
    const syncRoute = () => setScreenId(readScreen());
    window.addEventListener('hashchange', syncRoute);
    return () => window.removeEventListener('hashchange', syncRoute);
  }, []);

  const screen = screens.find((item) => item.id === screenId) ?? screens[0];
  const Page = pagesByScreen[screen.id] ?? LoginPage;
  return <AppLayout screen={screen}><Page /></AppLayout>;
}
