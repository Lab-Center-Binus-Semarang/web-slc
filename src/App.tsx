/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Team } from './pages/Team';
import { Admin } from './pages/Admin';
import { ManageTeam } from './pages/ManageTeam';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="team" element={<Team />} />
          <Route path="admin" element={<Admin />} />
          <Route path="admin/team" element={<ManageTeam />} />
        </Route>
      </Routes>
    </Router>
  );
}
