import '@babel/polyfill';
import axios from 'axios';
import { showAlert } from './alert';

// export const UpdateSettings = async (name, email) => {
//   try {
//     const res = await axios({
//       method: 'PATCH',
//       url: 'http://localhost:8000/api/v1/users/updateMe',
//       data: {
//         name,
//         email
//       }
//     });
//     // console.log('result',res);
//     if (res.data.status === 'success') {
//         showAlert('success', 'Profile Updated Successfully');}
//   } catch (err) {
//     showAlert('error', err.response.data.msg);
//   }
// };

// type is either password or data
export const UpdateSettings = async (data, type) => {
  try {
    const url =
      type === 'password'
        ? '/api/v1/users/updateMyPassword'
        : '/api/v1/users/updateMe';
    const res = await axios({
      method: 'PATCH',
      url,
      data
    });
    // console.log('result',res);
    if (res.data.status === 'success') {
      showAlert('success', ` ${type.toUpperCase()} Updated Successfully`);
      window.setTimeout(()=>{
        location.assign('/me');
    }, 500)
    }
  } catch (err) {
    showAlert('error', err.response.data.msg);
  }
};


