import { login, logout } from './login';
import { signup } from './signup';
import { dsiplayMap } from './mapbox';
import {UpdateSettings } from './updateSettings';
import {UpdateTour} from './updateTour';


//  dom elemnts
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.from--login');
const signUpForm = document.querySelector('.form2');
const logOutBtn = document.querySelector('.nav__el--logout')
const updateBtn = document.querySelector('.form-user-data')
const updatePasswordBtn = document.querySelector('.form-user-password')
const updateTourBtn= document.querySelector('.form-tour') 

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


// if(updateBtn){
//   updateBtn.addEventListener('submit', e=>{
//     e.preventDefault();
//     const name = document.getElementById('name').value;
//     const email = document.getElementById('email').value;

//     UpdateSettings({name,email}, 'data')
//   })
// }



if(updateBtn){
  updateBtn.addEventListener('submit', e=>{
    e.preventDefault();
    const form = new FormData();
    form.append('name',document.getElementById('name').value);
    form.append('email',document.getElementById('email').value);
    form.append('photo',document.getElementById('photo').files[0]);
    console.log(form);
    

    UpdateSettings(form, 'data')
  }) 
}

if(updatePasswordBtn){
  updatePasswordBtn.addEventListener('submit', async e=>{
    e.preventDefault();

    document.querySelector('.btn--save-password').textContent = 'Updating...'
    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    // to clear input fields
    await UpdateSettings({passwordCurrent, password, passwordConfirm}, 'password')
    document.querySelector('.btn--save-password').textContent = 'Save Password'
    document.getElementById('password-current').value= '';
    document.getElementById('password').value= '';
    document.getElementById('password-confirm').value= '';
  })
}

if(updateTourBtn){
  updateTourBtn.addEventListener('submit',e=>{
    e.preventDefault();

    const name = document.getElementById('name').value;
    const slug = document.getElementById('slug').value;
    const duration =document.getElementById('duration').value
    const maxGroupSize= document.getElementById('maxGroupSize').value
    const difficulty=document.getElementById('difficulty').value
    const price=document.getElementById('price').value
    const tourID=document.getElementById('id').value
//     UpdateSettings({name,email}, 'data')
    
    UpdateTour({name,slug, duration, maxGroupSize, difficulty, price, tourID});
  })
}