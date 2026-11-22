import { scenariosPage } from '../views/scenarios.js';
import { siteNav } from '../views/site-nav.js';

document.querySelector('.topnav').innerHTML = siteNav('scenarios');
document.querySelector('main').innerHTML = scenariosPage();
