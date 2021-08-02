import React from 'react'
import DocumentTitle from "react-document-title";

import AuthProvider from "./auth-provider";
import Router from "./router";

const AppContent = () => {
  return (
    <DocumentTitle title="Личный кабинет">
      <Router />
    </DocumentTitle>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
