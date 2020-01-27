import '@babel/polyfill';
import axios from 'axios';
import { showAlert } from './alert';

export const UpdateTour = async (
  name,
  slug,
  duration,
  maxGroupSize,
  difficulty,
  price,
  tourID
) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: `/api/v1/tours/5e11ed27e83b193cc0432536`,
      
      data: {
        name,
        slug,
        duration,
        maxGroupSize,
        difficulty,
        price
      }
    });
    
    if (res.data.status === 'success') {
      showAlert('success', 'Profile Updated Successfully');
      window.setTimeout(() => {
        location.assign('/me');
      }, 500);
    }
  } catch (err) {
    // showAlert('error', err.response.data.msg); 
    console.log(err);
    
  }
};
