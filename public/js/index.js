import { login, logout } from './login';
import { signup } from './signup';
import { dsiplayMap } from './mapbox';


//  dom elemnts
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.from--login');
const signUpForm = document.querySelector('.form2');
const logOutBtn = document.querySelector('.nav__el--logout')


if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  // console.log(locations);
  dsiplayMap(locations);
}

if (loginForm) {
  loginForm.addEventListener('submit', e => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    login(email, password);
  });
}


if(logOutBtn) logOutBtn.addEventListener('click', logout)


if (signUpForm) {
  signUpForm.addEventListener('submit', e => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfrim = document.getElementById('passwordConfirm').value;

    signup(name,email, password, passwordConfrim);
  });
}


