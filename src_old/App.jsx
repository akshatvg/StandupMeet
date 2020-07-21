import React from 'react';
import './App.css';
import { Route, Switch } from 'react-router-dom';
import Index from './pages/index';
import Meeting from './pages/meeting';
import NoMatch from './pages/404';

import { BrowserRouterHook } from './utils/use-router';
function App() {
	return (
		<BrowserRouterHook>
			<Switch>
				<Route exact path="/meeting/:name" component={Meeting} />
				<Route path="/" component={Index} />
				<Route exact path="/hello" component={Index} />
			</Switch>
		</BrowserRouterHook>
	);
}

export default App;
