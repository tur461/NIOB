import Application from './Application';
import { Provider } from "react-redux";
import configureStore from './redux/store';
import { history } from './redux/reducers/history';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ConnectedRouter } from "connected-react-router";
import { PersistGate } from 'redux-persist/lib/integration/react';
import './App.scss';

let { store, persistor } = configureStore();

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ConnectedRouter history={history}>
          <Application></Application>
        </ConnectedRouter>
      </PersistGate>
    </Provider>
  );
}

export default App;
