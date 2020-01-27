
var stripe = Stripe('pk_test_7ilLyx0goVe1GPrKnx8aIIHF00udshyaw6');
import axios  from 'axios';
import { showAlert } from './alert';

export const bookTour = async tourId => {

    try {
         // 1 get the session from the server (api)
    const session = await axios(`http://localhost:8000/api/v1/bookings/checkout-session/${tourId}`)  

    // console.log(session); 
    
    // 2 create checkout from + charge the credit card 

    await stripe.redirectToCheckout({
        sessionId: session.data.session.id 
    });
  
    } catch (err) {
        console.log(err);
        showAlert('error', err)
    }
   
}