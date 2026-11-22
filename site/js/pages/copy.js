import { copyPage } from '../views/copy.js';
import { siteNav } from '../views/site-nav.js';

document.querySelector('.topnav').innerHTML = siteNav('copy');
document.querySelector('main').innerHTML = copyPage();
