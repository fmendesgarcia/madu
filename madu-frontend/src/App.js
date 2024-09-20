import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AlunoPage from './pages/AlunoPage';
import ProdutoPage from './pages/ProdutoPage';

function App() {
  return (
    <Router>
      <div className="App">
        <Switch>
          <Route path="/" exact component={HomePage} />
          <Route path="/alunos" component={AlunoPage} />
          <Route path="/produtos" component={ProdutoPage} />
          {/* Outras rotas conforme necessário */}
        </Switch>
      </div>
    </Router>
  );
}

export default App;
