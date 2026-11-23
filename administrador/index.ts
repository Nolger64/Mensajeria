import { createElement } from 'react';
import { registerRootComponent } from 'expo';
import App from '../App';

function RoleApp() {
  return createElement(App, { requiredRole: 'administrador' });
}

registerRootComponent(RoleApp);
