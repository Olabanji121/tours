import '@babel/polyfill';
import axios from 'axios';
import {showAlert} from './alert'


 export const signup = async(name, email, password, passwordConfirm)=>{

    try {
        const res= await axios({
            method: 'POST',
            url: '/api/v1/users/signup', 
            data:{
                name,
                email,
                password,
                passwordConfirm
            }
        });  


        if(res.data.status === 'success'){
            showAlert('success','Account Created Successfully!')
            window.setTimeout(()=>{
                location.assign('/');
            }, 1500)
        }
     
        
    } catch (err) {
        const msg =  err.response.data.message.split(' ')
    showAlert('error', msg.slice(4,15).join(' '));
    
        
    }
    
   
}

